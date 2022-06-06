const PORT = 5000
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

app.use(express.static('public'))  
app.use('/css', express.static(__dirname + 'public/css'))
app.use('/js', express.static(__dirname + 'public/js'))

app.set('views', './views') 
app.set('view engine', 'ejs')

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
            const $ = cheerio.load(html)

            $(contains, html).each(function() {  
                                                
                const info = $(this).text() 
                const url = $(this).attr('href')
                
                if( info !== ""){
                    infoArray.push({
                        info,
                        url: array.base + url,
                        source: 'Best Buy Top Rated '+ array.website
                    })
                }
            })
        })
    }) 
}

specificInfo = (paramId, array, contains, res, cpu, infoArray) => {

    let informationAddress
    let informationBase

    if (paramId == 'Desktops'){
        informationAddress = array[0].address 
        informationBase = array[0].base
    }
    else {
        informationAddress = array[1].address  
        informationBase = array[1].base
    }

    infoArray.length = 0

    axios.get(informationAddress)
    .then(response => {
        const html = response.data
        const $ = cheerio.load(html)

        $(contains, html).each(function () {
            const info = $(this).text()
            const url = $(this).attr('href')

            if(info !== "") {
                infoArray.push({
                    info,
                    url: informationBase + url,
                    source: 'Best Buy Top Rated '+ paramId
                })
            }
        })

        results = arrayLoop(specificPage, "Top Rated "+ cpu +" Builds For " + paramId)
        res.render('ResultPage', {results})
    })
    .catch(err => console.log(err))
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

app.get('/', (req,res) => {
    res.render( 'WSHomePage')
})

app.get('/amd', (req,res) => {
    results = arrayLoop(amdPage, "TOP RATED AMD BUILDS FOR DESKTOPS AND LAPTOPS")
    res.render('ResultPage', {results})
})

app.get('/intel', (req,res) => {
    results = arrayLoop(intelPage, "TOP RATED INTEL BUILDS FOR DESKTOPS AND LAPTOPS")
    res.render('ResultPage', {results})
})

app.get('/amdDesktops', (req, res) => {
    const amdId = "Desktops"
    specificInfo(amdId, amdInformation, containsAMD, res, "AMD", specificPage)
    console.log(specificInfo);
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