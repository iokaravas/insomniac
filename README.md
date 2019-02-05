# insomniac

A [Node](http://nodejs.org/) module that parses the popular, (at least in Greece) classifieds website, insomnia.gr

Please note that this is a personal side project I work on during my free time. I may use weird/uncommon ways of doing stuff just for learning purposes.
As it stands though, the software is fully functional and I'm pushing only working prototypes.

If you wish you can always drop me a line with suggestions/issues in [issues](https://github.com/iokaravas/insomniac/issues) at [@karavas](https://twitter.com/karavas).

### Dependencies

insomniac has the following dependencies:

- [cheerio](https://www.npmjs.com/package/cheerio) (for parsing purposes)
- [request](https://www.npmjs.com/package/request) (how else?)
- [request-native-promise](https://www.npmjs.com/package/request-promise-native) (because we're all ES6 pros)
- [querystring](https://www.npmjs.com/package/querystring) 

### Quick Start

You can install this module using [npm](http://github.com/isaacs/npm):


    npm install https://github.com/iokaravas/insomniac.git --save


### Load in the module
    const insomniac = require('insomniac')

### Example uses

##### Printing on screen latest classifieds (2 pages) with title containing 'Playstation 4' or 'PS4'

    insomniac.latest(2, {title: ['Playstation 4','PS4']}).then(function (listings) {
        listings.map(listing => console.log(listing))
    })
    
##### Printing on screen all the available categories (in url format)

    insomniac.listCategories().then(function (categories) {
        categories.forEach(function (category) {
            console.log(Object.entries(category)[0].join('-'))
        })
    })
    
##### Printing on screen classifieds in category '8-πλήρη-συστήματα' (5 pages) with title containing 'Ryzen'

    insomniac.category(5, {title: ['Ryzen']},'8-πλήρη-συστήματα').then(function (listings) {
        listings.map(listing => console.log(listing))
    })
    
This will print an array of objects (classified listings) of this structure:

    { 
        title: 'The classified title',
        price: '50', // the price in EUR
        thumb: 'insomnia_classified_image.jpeg',
        url: 'http://link-to-classified-in-site/',
        date: '2019-02-05T15:20:36Z'
     }

Unfortunately date information is not available when using insomniac.latest().

### Authors

* **Ioannis (John) Karavas** - *Initial work* - [iokaravas](https://github.com/iokaravas)

See also the list of [contributors](https://github.com/insomniac/contributors) who participated in this project.

****DISCLAIMER:****

Much of the parsing is quite fragile. Since sites change all the time, it is not uncommon for parsers to break when pages change in some way.

### TODO
Several things could be added and/or improved, including :

* Allow for more precise filtering, **as currently only title is taken into consideration**
* Discard parameters for options object instead
* Handle specific errors, although you still can catch the final error from Promise.all()
* Parse even more information
* Better naming

