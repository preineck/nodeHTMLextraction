const os = require('os');
const fs = require('fs')
const cheerio = require('cheerio');
const xml2js = require('xml2js');
// const htmlparser = require("htmlparser");
// const textract = require('textract');
// const h2j = require('html-to-json');
//const testDoc = require('../samples/sample.html')
 
var input_windows = "C:\\Users\\paulr\\Google Drive\\Clients\\PWH\\NodeExtraction\\samples\\sample.html";
var input_macos = "/Users/johnreineck/Google Drive/Clients/PWH/NodeExtraction/samples/sample.html";
var currentOS = os.platform();
console.log('Current OS: ',currentOS);


// Load in HTML data
var test = fs.readFileSync(currentOS === 'win32' ? input_windows:input_macos).toString();
$ = cheerio.load(test);
//$( selector, [context], [root] )
 
// Get patient ID:
idLocation = test.indexOf("PATIENTID =");
tickLocation = test.indexOf("'",idLocation+14);
patientID = test.substring(idLocation+11,tickLocation).replace("'","");
//console.log('Patient ID: ', patientID);

// Get the Chart ID, whatever that is...
chartIdLocation = test.indexOf("CHARTID =");
tickLocation = test.indexOf("'",chartIdLocation+14);
chartID = test.substring(chartIdLocation+11,tickLocation).replace("'","");
//console.log('Chart ID: ', chartID);


//DEMOGRAPHICS HEADERS
demoHeader = $('.readonlydisplayfieldlabel','.clinicals_patient_chart_pm_demographicshtml_sub').text();
// console.log(demoHeader);
 
// DEMOGRAPHICS VALUES
demoValues = $('.readonlydisplayfielddata','.clinicals_patient_chart_pm_demographicshtml_sub').text();

// DEMOGRAPHICS TO ARRAY
const demoHdr =[];
$('.readonlydisplayfieldlabel','.clinicals_patient_chart_pm_demographicshtml_sub').each(function (i, elem) {
    demoHdr[i] = $(this).text();
});
const demoVal = [];
  $('.readonlydisplayfielddata','.clinicals_patient_chart_pm_demographicshtml_sub').each(function (i, elem) {
      demoVal[i] = $(this).text();
  });
console.log('DEMOGRAPHICS');
for (var i =0; i<demoHdr.length; i++)
{   
    console.log(demoHdr[i],': ',demoVal[i]);
}

// FAMILY HX
const famHx = [];
$('.familyhxtable','.clinicalsummarybox').each(function (i,elem) {
    famHx[i] = $(this).text();
})
console.log('FAMILY HISTORY');
for (var i=0; i<famHx.length;i++)
{
    console.log(famHx[i]);
}


// SURGICAL HX
const surgHx = [];
$('.surgicalhxlist').each(function (i,elem) {
    surgHx[i] = $(this).text().trim();
});
console.log('SURGICAL HISTORY');
for (var i =0; i<surgHx.length;i++)
{
    console.log(surgHx[i]);
}

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

// PROBLEMS
ptProb = [];
$('.problemitem').each(function (i,elem) {
    ptProb[i] = $(this).text().trim();
})
console.log('PATIENT PROBLEMS');
for (var i =0; i<ptProb.length; i++)
{
    console.log(ptProb[i]);
}

// VACCINES 
immHx = [];
$('.clinical_patient_vaccinelist_htmlsummary_sub').each(function (i,elem) {
    immHx[i] = $(this).text().trim();
})
console.log('VACCINES');
for (var i =0; i<immHx.length; i++)
{
    console.log(immHx[i]);
}

// ALLERGIES
//
activeAllergies = $('.activeallergy').text();
console.log('ALLERGIES');
console.log(activeAllergies);

// what if we just grab clinicalsummary...(kind of generic)
generic = $('.medicationtable tr').nextUntil('.clinical_patient_vaccinelist_htmlsummary_sub').text();
console.log('GENERIC: ',generic);

$('.medicationtable').find('.medicationrow').find('td').children().each( (i,e)=>{console.log(i + ". %o" , e)})

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