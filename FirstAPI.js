// for creating and selling your api
//npm init was the first thing I did, typed it in the terminal to install packages and modules in the project to use
// any project that uses node js will need to have a package json file
// package json file does a lot more than hold our packages and the versions that they need, look it up later, google "beginners guild to using npm"

// create a package json file using the command npm init, answer the questions, press enter to accept defaults suggestions or type a new value and hit enter
// Make sure your package.json file is in the same folder as your project

// install package, go to npmjs.com   I'm using cheerio for this one, cheerio is used to pick out html elements of a webpage
// package-lock.json is automatically installed because of the dependencies thats needed for each npm I install
// I install express, express is a backend framework for node js
// express is a framework for node.js, designed for building web..
// .. applications and api's
// intall ejs, ejs is a simple template that lets ...
// you generate html mockup with javascript
// install axios, axios is used to get ,post, or delete data 
// added nodemon script in package.json to listen out for any changes
// localhost:5000 in http

const PORT = 5000 // port I want to open my server on
const express = require('express')
const axios = require('axios')
const cheerio = require('cheerio')
const app = express()

const deskTops = 'https://www.bestbuy.com/site/searchpage.jsp?_dyncharset=UTF-8&browsedCategory=pcmcat287600050002&id=pcat17071&iht=n&ks=960&list=y&qp=customerreviews_facet%3DCustomer%20Rating~Top-Rated&sc=Global&st=categoryid%24pcmcat287600050002&type=page&usc=All%20Categories'
const lapTops = 'https://www.bestbuy.com/site/searchpage.jsp?_dyncharset=UTF-8&browsedCategory=pcmcat287600050003&id=pcat17071&iht=n&ks=960&list=y&qp=customerreviews_facet%3DCustomer%20Rating~Top-Rated&sc=Global&st=categoryid%24pcmcat287600050003&type=page&usc=All%20Categories'
const containsAMD = 'a:contains("AMD Ryzen")'
const containsINTEL = 'a:contains("Intel Core")'

const amdInformation = [], intelInformation = [], amdPage = [], intelPage = [], specificPage = []
let results

// first step to setting up html, css with node.js
// for css and others
//create static files
// name of folder which is public
// need to do this for the css to work
// I did not add another js file
// type css/filename.css in link rel
app.use(express.static('public'))  // the used function is used to register the middleware/folder paths  to the localhost server
app.use('/css', express.static(__dirname + 'public/css'))
app.use('/js', express.static(__dirname + 'public/js'))

// one of many ways to set up html for node.js
// change html pages to ejs, make sure they are in the view folder
//set the views, views is the directory where the template files are located
//next set the view engine
app.set('views', './views') //
app.set('view engine', 'ejs') // the actual template engin I'm using, ejs, I was using pug it would be ,'pug'
// ejs is one of many template engines that work with express
/*  res.render('amd', {
        info: amdPage[0].info, 
        url: amdPage[0].url,
        source: amdPage[0].source
    }) in   html/ejs <%- JSON.stringify(info) %> <%- JSON.stringify(url) %> ... */

langauageInfo = (array,desktops,laptops) => {  
    return array.push(
        {
            website: 'Desktops',
            address: desktops,
            base: 'https://www.bestbuy.com/',
        },
        {
            website: 'Laptops',
            address: laptops,
            base: 'https://www.bestbuy.com/',         
        }
    )
}

pushInfo = (array, contains,infoArray) => {

    array.forEach(array => {

        axios.get(array.address)
        .then(response => {  

            const html = response.data 
            const $ = cheerio.load(html) // storing the load function inside a variable, not calling it yet
                                        //allows me to pick out html elements because its loading the response.data

            // pick out anything that contains (whatever I want) with an a tag in html
            // for each one that comes back pass the elements through a function
            // then grab the text and url for each one that comes back
            // then push the text and url in its own array
            // then display the array using json
            // finally catch any errors

            $(contains, html).each(function() {  // calling the cheerio.load function, adding the string information needed so it can run and using the html arrgument that I passed in before
                                                //arrow function won't work here for some reason
                const info = $(this).text() // text inside of <a
                const url = $(this).attr('href') // the actuall link of the <a

                infoArray.push({
                    info,
                    url: array.base + url, // appending the base in front of the url so the links can work
                    source: 'Best Buy Top Rated '+ array.website
                })
            })
        })
    }) 
}

specificInfo = (paramId, array, contains, res, cpu, infoArray) => {

   /* if I was going to do for example localhost:5000/amd/:id
   const informationAddress = array.filter(array => array.website == paramId)[0].address
    const informationBase = array.filter(array => array.website == paramId)[0].base*/

    let informationAddress
    let informationBase

    // if the Id == the website inside amdInformation, amdInformation will return 1 array, so now I take the array and get the address of whatever I call
    if (paramId == 'Desktops'){
        informationAddress = array[0].address  // had to use [0] because array would not work with filter
        informationBase = array[0].base
    }
    else {
        informationAddress = array[1].address  
        informationBase = array[1].base
    }

    infoArray.length = 0 // must do this to avoid objects getting appended to the array

    axios.get(informationAddress)
    .then(response => {
        const html = response.data
        const $ = cheerio.load(html)

        $(contains, html).each(function () {
            const info = $(this).text()
            const url = $(this).attr('href')

            //results += "<br><br><a href="+ informationBase + url +">" + info + "</a>" + "<br><p>Source:" + source + "</p>"
            
            infoArray.push({
                info,
                url: informationBase + url,
                source: 'Best Buy Top Rated '+ paramId
            })
        })

        results = arrayLoop(specificPage, "Top Rated "+ cpu +" Builds For " + paramId)
        res.render('ResultPage', {results})
    })

    .catch(err => console.log(err))  // catch any errors, must be after everything else
}

arrayLoop = (array, h1) => {
    let render = "<br><h1>"+h1+"</h1>" 
    for(let i = 0; i < array.length; i++){ 
        render += "<br><br><a href="+ array[i].url +">" + array[i].info + "</a>" + "<br><p>Source:" + array[i].source + "</p>"
    }
    return render
}

langauageInfo(amdInformation,deskTops,lapTops)
langauageInfo(intelInformation,deskTops,lapTops)

pushInfo(amdInformation, containsAMD, amdPage)
pushInfo(intelInformation, containsINTEL, intelPage)

// can add anything after the / for example '/JJ' that now means if we visit localhost:5000/JJ
app.get('/', (req,res) => { //  '/' = listen out when we visit the home page and print res.render
    res.render( 'WSHomePage')
})

app.get('/amd', (req,res) => {
    results = arrayLoop(amdPage, "TOP RATED AMD BUILDS FOR PC AND LAPTOPS") // creates string with html elements from the information inside the array, for ejs  
    res.render('ResultPage', {results})
})

app.get('/intel', (req,res) => {
    //res.json(intelPage)
    results = arrayLoop(intelPage, "TOP RATED INTEL BUILDS FOR PC AND LAPTOPS")
    res.render('ResultPage', {results})
})

// getting information about  laptops only from best buy
// example I could type in localhost:5000/amd/Laptops 
/*app.get('/amd/:Id', (req,res) => {  // : is the syntext for an any id, I could name it anything I want
    const amdId = req.params.Id*/ // whatever we pass after the : will be saved in params 
    // then specificinfo will check if amdId is equal to any array.website, if so it will pull in the information from that array object only
    // can't use this because I have links for each catagory 

app.get('/amdDesktops', (req, res) => {
    const amdId = "Desktops"
    specificInfo(amdId, amdInformation, containsAMD, res, "AMD", specificPage)
})

app.get('/amdLaptops', (req, res) => {
    const amdId = "Laptops"
    specificInfo(amdId, amdInformation, containsAMD, res, "AMD", specificPage)
})

app.get('/intelDesktops', (req, res) => {
    const intelId = "Desktops"
    specificInfo(intelId, intelInformation, containsINTEL, res, "INTEL", specificPage)
})

app.get('/intelLaptops', (req, res) => {
    const intelId = "Laptops"
    specificInfo(intelId, intelInformation, containsINTEL, res, "INTEL", specificPage)
})

app.listen(PORT, () => console.log(`server running on PORT ${PORT}`)) 