var debug =1;
const sql = require('mssql');
const os = require('os');
const fs = require('fs')
const cheerio = require('cheerio');

var connString = {
server: "192.168.202.50\\DEV",
database: "OMNI_OH_PWH_STAGING",
user: "preineck",
password: "158hjKu93",
port: 1433
}

// SQL Insert Variables:
var currentDOS;
var currentSection;
var patientID;
var sectionContent;
var sqlEncounterInserts = [];
var sqlDemoInserts = [];
var sqlClinicalInserts = [];

sql.connect(connString);
//`insert into [nodeHTML].[encounter_extraction] (patientId, DOS, sectionName, sectionContent) values ('${patientID}','${currentDOS}','${currentSection}','${sectionContent}')`

 async function insertRow(thing) {
    var dbConn = new sql.Connection(connString);
    dbConn.connect().then(function () {
        var transaction = new sql.Transaction(dbConn);
        transaction.begin().then(function () {
            var request = new sql.Request(transaction);
            request.query(thing)
        .then(function () {
                transaction.commit().then(function (recordSet) {
                    console.log('Recordset: ',recordSet);
                  //  dbConn.close();
                }).catch(function (err) {
                    console.log("Error in Transaction Commit " + err);
                  //  dbConn.close();
                });
            }).catch(function (err) {
                console.log("Error in Transaction Begin " + err);
               // dbConn.close();
            });
        }).catch(function (err) {
            console.log(err);
           // dbConn.close();
        });
    }).catch(function (err) {
        console.log(err);
    });
}

// HTML Source:
var input_windows = "C:\\Users\\paulr\\Google Drive\\Clients\\PWH\\NodeExtraction\\samples\\sample.html";
var input_macos = "/Users/johnreineck/Google Drive/Clients/PWH/NodeExtraction/samples/sample.html";
var currentOS = os.platform();
console.log('Current OS: ',currentOS);

// Load in HTML data
var html = fs.readFileSync(currentOS === 'win32' ? input_windows:input_macos).toString();
$ = cheerio.load(html);
//$( selector, [context], [root] )
 
// Get patient ID:
idLocation = html.indexOf("PATIENTID =");
tickLocation = html.indexOf("'",idLocation+14);
patientID = html.substring(idLocation+11,tickLocation).replace("'","");
if (debug)
{
    console.log('Patient ID: ', patientID);
}

// Get the Chart ID, whatever that is...
chartIdLocation =html.indexOf("CHARTID =");
tickLocation = html.indexOf("'",chartIdLocation+14);
chartID = html.substring(chartIdLocation+11,tickLocation).replace("'","");
if (debug)
{
    console.log('Chart ID: ', chartID);
}

// DEMOGRAPHICS TO ARRAY
console.log('DEMOGRAPHICS');
const demoHdr =[];
$('.readonlydisplayfieldlabel','.clinicals_patient_chart_pm_demographicshtml_sub').each(function (i, elem) {
    demoHdr[i] = $(this).text().replace('\'', '\'\'');
});
const demoVal = [];
  $('.readonlydisplayfielddata','.clinicals_patient_chart_pm_demographicshtml_sub').each(function (i, elem) {
      demoVal[i] = $(this).text().replace('\'', '\'\'');
  });
if (debug)
{
    for (var i =0; i<demoHdr.length; i++)
    {   
        sqlDemoInserts[i] = `insert into nodeHTML.demographics_extraction (patientID, chartId, attributeName, attributeValue) values ('${patientID}','${chartID}','${demoHdr[i]}','${demoVal[i]}')`
        console.log(demoHdr[i],': ',demoVal[i]);
    }
}


// FAMILY HX
const famHx = [];
$('.familyhxtable','.clinicalsummarybox').each(function (i,elem) {
    famHx[i] = $(this).text().replace('\'', '\'\'');
})
console.log('FAMILY HISTORY');
if (debug)
{
    for (var i=0; i<famHx.length;i++)
    {
        sqlClinicalInserts.push(`insert into [nodeHTML].[clinical_extraction] (patientId, sectionName, sectionContent) values ('${patientID}','FamilyHx','${famHx[i]}')`);
        console.log(famHx[i]);
    }
    
}

// SURGICAL HX
const surgHx = [];
$('.surgicalhxlist').each(function (i,elem) {
    surgHx[i] = $(this).text().trim().replace('\'', '\'\'');
});
console.log('SURGICAL HISTORY');
if (debug)
{
    for (var i =0; i<surgHx.length;i++)
    {
        sqlClinicalInserts.push(`insert into [nodeHTML].[clinical_extraction] (patientId, sectionName, sectionContent) values ('${patientID}','SurgicalHx','${surgHx[i]}')`);
        console.log(surgHx[i]);
    }
}

// PROBLEMS
ptProb = [];
$('.problemitem').each(function (i,elem) {
    ptProb[i] = $(this).text().trim().replace('\'', '\'\'');
})
console.log('PATIENT PROBLEMS');
if (debug)
{
    for (var i =0; i<ptProb.length; i++)
    {
        sqlClinicalInserts.push(`insert into [nodeHTML].[clinical_extraction] (patientId, sectionName, sectionContent) values ('${patientID}','Problems','${ptProb[i]}')`);
        console.log(ptProb[i]);
    }   
}

// VACCINES 
immHx = [];
$('.clinical_patient_vaccinelist_htmlsummary_sub').each(function (i,elem) {
    immHx[i] = $(this).text().trim().replace('\'', '\'\'');
})
console.log('VACCINES');
if (debug)
{
    for (var i =0; i<immHx.length; i++)
    {
        console.log(immHx[i]);
        sqlClinicalInserts.push(`insert into [nodeHTML].[clinical_extraction] (patientId, sectionName, sectionContent) values ('${patientID}','Immunizations','${immHx[i]}')`);
    }
}


// ALLERGIES
allergies = [];
activeAllergies = $('.activeallergy').each(function (i,elem) {
    allergies[i] = $(this).text().trim().replace('\'', '\'\'');
})

for (var i =0; i < allergies.length; i++)
{
    if (debug){
    console.log(allergies[i]);
    sqlClinicalInserts.push(`insert into [nodeHTML].[clinical_extraction] (patientId, sectionName, sectionContent) values ('${patientID}','Allergies','${allergies[i]}')`);
    
    }
    
}
// Record encounter stuff

$('.clinicalsummary').each(function (i,e) {
    currentSection = $(e).attr('sectionname');
    
    if (currentSection)
    {
 //       console.log(e);
         //console.log('SECTION: ',currentSection);
        if (currentSection ==="Patient")
        {
            // console.log('Getting DOS');
            var text = $(e).find('tr').find('td').eq(1).map(function() {
                currentDOS =    $(this).text().trim();
                 console.log('This DOS is:', $(this).text().trim());
            }).get()
            
        }
        sectionContent = $(this).text().replace('~','').replace('\n','<br>').replace('\'', '\'\'');   

        sqlEncounterInserts[i] =  `insert into [nodeHTML].[encounter_extraction] (patientId, DOS, sectionName, sectionContent) values ('${patientID}','${currentDOS}','${currentSection}','${sectionContent}')`;
     
        
        // console.log('PATIENT ID: ',patientID);
        // console.log('DOS: ',currentDOS);
        // console.log('SECTION: ',currentSection);
        // console.log('CONTENT:', sectionContent); 
        
        // //`insert into nodeHTML.encounter_extraction (patientID, DOS,sectionName,sectionContent) values ('${patientId}','${currentDOS}','${currentSection}','${$(this).text().replace('~','').replace('\'','')}')`
        // console.log('---------------------------------------------------------------------------------------------------------------------------');
    }
})

   
// Medications
var medData = [];
$('.medicationtable').each(function (i,td) {
    var children =$(this).children();
    var contents =children.eq(i).text()+" ";
   // var itemName =children.eq(i);

   medData[i] = contents.replace('NameDateSource','').trim().split("\n")
    // var row = {
    //     'Rows': contents.replace('NameDateSource','').replace("entered","entered: ").trim().split("\n")
    // };
    // medData.push(row);
    //console.log(row);
   
})
var splitMedData = [];
for (var i =0; i < medData.length; i++)
{
    for (var j = 0; j < medData[i].length; j++)
    {
        splitMedData[i] = medData[i][j].replace('entered','entered: ').replace('.','.  ').replace('\'', '\'\'');
        console.log(splitMedData[i]);
        sqlClinicalInserts.push(`insert into [nodeHTML].[clinical_extraction] (patientId, sectionName, sectionContent) values ('${patientID}','Medications','${splitMedData[i][j]}')`);
    }
}
// for (var i =0; i<splitMedData.length; i++)
// {
//     sqlClinicalInserts.push(`insert into [nodeHTML].[clinical_extraction] (patientId, sectionName, sectionContent) values ('${patientID}','Medications','${splitMedData[i]}')`);
//     console.log(splitMedData[i]);
// }

/* Insert Demographics records:*/
 for (var i = 0; i< sqlDemoInserts.length; i++)
 {
     console.log(sqlDemoInserts[i]);  
     insertRow(sqlDemoInserts[i]);
 }


/* Insert Encounter records:*/
 for (var i = 0; i< sqlEncounterInserts.length; i++)
 {
    // console.log(sqlEncounterInserts[i]);  
     insertRow(sqlEncounterInserts[i]);
 }

/* Insert Clinical records:*/
 for (var i = 0; i< sqlClinicalInserts.length; i++)
 {
     console.log(sqlClinicalInserts[i]);  
     insertRow(sqlClinicalInserts[i]);
 }

sql.close();
// var generic = [];
// $('.clinicalsummarybox table tr td').each(function (i,e) {
//     for (var key in e.children)
//         {
//             if (!key.hasOwnProperty(key)) continue;
//             var obj = e.children[key];
//             for (var prop in obj)
//                 {
//                 if(!obj.hasOwnProperty(prop)) continue;
//                     if( prop ==="data")
//                     {
//                         console.log(i,prop+ '= '+obj[prop]);
//                     }
                
//                 }
//         }
// })
// var generic2 =[];
// $('.clinicalsummarybox table tr td').each(function (i,e) {
//     var contents =$(this).text();
    
//     console.log('generic2',contents);
// })
// $('.medicationtable').find('.medicationrow').find('td').children().each( (i,e)=>{
//         console.log(i, e);
//         $(e).each( (i,e) => {
//             for (var key in e.children)
//             {
//                 if (!key.hasOwnProperty(key)) continue;
//                 var obj = e.children[key];
//                 for (var prop in obj)
//                     {
//                     if(!obj.hasOwnProperty(prop)) continue;
//                     console.log(i,prop+ '= '+obj[prop]);
//                     }
//             }
//         })
        // var $ = cheerio.load(html);
        // var arr = $('a[class=A]');   
        // var array = [];
        // arr.each(function() {
        //     array.push({
        //         title: $(this).attr('title'),
        //         IP: $(this).text()
        //     });
        // });
        // var text = $("div.A")
        // .contents()
        // .filter(function() {
        //     return this.nodeType === 3; // 3 = Text node
        // })
        // .map(function() {
        //     return this.nodeValue;
        // })
        // .get();
        //fs.writeFileSync('medicationTable.json',JSON.stringify(e)); //no dice
        // for (var key in e.children)
        // {
        //     if (!key.hasOwnProperty(key)) continue;
        //     var obj = e.children[key];
        //     for (var prop in obj)
        //         {
        //         console.log(i,prop+ '= '+obj[prop]);
        //         }
        // }
        // if (!key.hasOwnProperty(key)) continue;
        // var obj = e.parent[key];
        // for (var prop in obj)
        //     {
        //         console.log('divprop: ',i,prop+ '= '+obj[prop]);
        //         if (prop ==="next")
        //         {
        //             $(obj.next).each( (i,e) => {
        //             console.log('next thing');
        //             for (var key in e.children)
        //                 {
        //                  if (!key.hasOwnProperty(key)) continue;
        //                  var obj = e.next[key];
        //                  for (var prop in obj)
        //                     {
        //                         console.log('next property',i,prop+ '= '+obj[prop]);                                    
        //                     }   
        //                 }
        //             })
        //         }
        //    }
//})

/*
<ul id="fruits">
  <li class="apple">Apple</li>
  <li class="orange">Orange</li>
  <li class="pear">Pear</li>
</ul>
*/
// $ = cheerio.load(test);
// textContent = $('.apple', '#fruits').text();
// console.log(textContent); // = "Apple"
 
// htmlString  = "<h1>Welcome Developers</h1>",
// $ = cheerio.load(htmlString),
// textContent = $('h1').text();
// console.log("textContent: ",textContent); 
 
// htmlString  = "<div id='divA'><div id='divB'><h1 class='message'>Hello Sandeep</h1>></div></div>",
// $ = cheerio.load(htmlString),
// textContent = $('h1.message').text();
// console.log("textContent: ",textContent);
 
// var doc = document.implementation.createHTMLDocument();
 
// var elements  = document.getElementsByTagName("*");
// for (var i =0; i<all.length; i++)
// {
//     console.log(all[i].toString());
// }



// xml2js
// console.log('----------');
// console.log('XML2JS:');
// var xml = fs.readFileSync(input_macos).toString();
// //console.log(xml);
// //var xml = "<root>Hello xml2js!</root>";
// //console.log(xml.toString());
// xml2js.parseString(xml,function(err,result){
//     console.dir(result);
// })
 
// htmlparser: this looked HALFWAY decent
// console.log('----------');
// console.log('HTMLparser:');
// var rawHtml = fs.readFileSync(input_macos).toString();
// var handler = new htmlparser.DefaultHandler(function (error,dom) {
// if (error)
//     {
//         console.log('HTML Parser error block: ',error);
//     }
//     else
//     {
 
//     }
 
// });
// var parser = new htmlparser.Parser(handler);
// parser.parseComplete(rawHtml);
// //sys.puts(sys.inspect(handler.dom, false,null));
// console.log(handler.dom);
 

// textract
// console.log('----------');
// console.log('Textract:');
// var extractedText = textract.fromFileWithPath(input_macos, function(error,text) {
//     console.log(text.substring(0,100));
// });
 
//html-to-json
// console.log('----------');
// console.log('HTML-to-JSON');
// var promise = h2j.parse(test, {
//     'text': function ($doc) {
//         return $doc.find('div').text();
//     }
// }, function(err, result) {
//     console.log(result);
// })

// var CCD = (function () {
//     function CCD(input) {
//         this.filePath = input;
//         var x = loadXML(input);
//         console.log(x.toString());
//         //this.header = new Header_1.Header(x);
//         //this.body = new Body_1.Body(x);
//     }
//     return CCD;
 
// }()); //end CCD
 
// console.log(CCD);
 
// function loadXML(fileName) {
//     var fs = require('fs'), path = require('path');
//     var xml2js = require('xml2js');
//     var json;
//     try {
//         var fileData = fs.readFileSync(fileName, 'utf8');
//         var CCD = new Array();
//         var parser = new xml2js.Parser({ explicitArray: true });
//         parser.parseString(fileData.toString(), function (err, result) {
//             CCD = result['ClinicalDocument'];
//             json = JSON.stringify(result);
//         });
//         return CCD;
//     }
//     catch (ex) {
//         console.log(ex);
//     }
// }
// MEDICATIONS -- BAD - NOT ALL MEDS HAVE ALL PROPERTIES 
// medName = [];
// $('.indented','.clinicalsummary').each(function (i,elem){
//     medName[i] = $(this).text().trim();    
// })
// for (var i =0; i<medName.length;i++)
// {
//     if (medName[i]==="Name")
//         {
//             medName[i] = null;
//         }
// }
// medNameFixed = []; //must remove header values in the indented class to sync up with medication details
// var actualMedCount =-1;
// for (var i =0; i<medName.length; i++)
// {
//     actualMedCount ++;
//     if (medName[i] === null)
//     {
//         actualMedCount--;
//     }
//     else medNameFixed[actualMedCount]= medName[i];
// }

// medSIG = []; 
// $('.medicationdetails','.clinicalsummary').each(function (i,elem){
//     medSIG[i] = $(this).text().trim();
// })

// medUser = [];
// $('.hideforprintfax','.clinicalsummary').each(function (i,elem){
//     medUser[i] = $(this).text().trim();
// })
// medUserFixed = []; //must remove header values in the hideforprint class to sync up with medication details
// var actualUserCount =-1;
// for (var i =0; i<medUser.length; i++)
// {
//     actualUserCount ++;
//     if (medUser[i] === "Source")
//     {
//         actualUserCount--;
//     }
//     else medUserFixed[actualUserCount]= medUser[i];
// }
// console.log('MEDICATIONS');
// for (var i=0; i<medName.length; i++)
// {

//     console.log(medNameFixed[i]);
//     console.log(medSIG[i]);
//     console.log(medUserFixed[i]);
//     console.log('-----------');
// }
// //DEMOGRAPHICS HEADERS
// demoHeader = $('.readonlydisplayfieldlabel','.clinicals_patient_chart_pm_demographicshtml_sub').text();
// // console.log(demoHeader);
 
// // DEMOGRAPHICS VALUES
// demoValues = $('.readonlydisplayfielddata','.clinicals_patient_chart_pm_demographicshtml_sub').text();
