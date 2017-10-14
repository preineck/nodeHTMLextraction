const cheerio = require('cheerio');
const fs = require('fs');

var input_windows = "C:\\Users\\paulr\\Google Drive\\Clients\\PWH\\NodeExtraction\\samples\\sample.html";
var test = fs.readFileSync(input_windows).toString();
$ = cheerio.load(test);

// Record encounter crap
var currentDOS;
$('.clinicalsummary').each(function (i,e) {
    var currentSection = $(e).attr('sectionname');
    
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
        console.log('DOS: ',currentDOS, 'SECTION: ',currentSection,'Content:', $(this).text());    
    }
})


// this works for grabbing encounter DOS (appt date/time) 
// var text = $('.clinicalsummary tr td').eq(1).contents().map(function() {
//     if (this.type)
//         console.log('map', $(this).text().trim());
// }).get()

//$('ul').attr('id')
//=> fruits

//$('.apple').attr('id', 'favorite').html()
//=> <li class = "apple" id = "favorite">Apple</li>

// var text = $('div.hello').contents().map(function() {
//     if (this.type === 'text')
//         return $(this).text().trim()
// }).get()