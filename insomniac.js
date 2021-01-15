const request = require('request-promise-native')
const cheerio = require('cheerio')
const querystring = require("querystring")

const DOMAIN = 'http://www.insomnia.gr/'
const CLASSIFIEDS_URL = DOMAIN + 'classifieds/'
const SEARCH_URL = CLASSIFIEDS_URL + 'search/?type=classifieds_advert'

// These might need updating from time to time, as the website design changes
const SELECTORS = {
    LATEST_ITEM: '.classifieds-index-adverts-latest article',
    CATEGORY_ITEM: '.classifieds-browse-adverts li',
    TITLE : 'h4',
    PRICE : 'p.cFilePrice .cFilePrice',
    THUMBNAIL : '.ipsThumb img',
    URL: 'h4 a'
}

let insomniac = {

    /***
     * Parses the site for a number of pages getting the latest listings, applying filters, if any.
     * @param {number} pages - The number of pages to parse
     * @param {object} filters - Keys and arrays of strings to filter out
     * @returns {Promise} - a Promise with an array of all the listings selected
     */
    latest: (pages = 1, filters) => {

        let downloadedPages = []

        for (let page = 1; page <= pages; page++) {

            downloadedPages.push(request(CLASSIFIEDS_URL + '?page=' + page).then(function (html) {

                let $ = cheerio.load(html)
                let listings = []

                $(SELECTORS.LATEST_ITEM).each(function () {
                    let thumbElement = $(this).find(SELECTORS.THUMBNAIL)
                    listings.push({
                        title: $(this).find(SELECTORS.TITLE).text().trim(),
                        price: parseFloat($(this).find(SELECTORS.PRICE).text().replace(',','.').trim()),
                        thumb: thumbElement.attr('data-flickity-lazyload') || thumbElement.attr('data-src'),
                        url: $(this).find(SELECTORS.URL).attr('href'),
                        dateScrapped: new Date()
                    })
                })

                return listings

            }))

        }

        return Promise.all(downloadedPages).then(function (listings) {

            listings = [].concat.apply([], listings)

            if ((filters)&&(filters.title.length !== 0)) {
                let titlesRegex = new RegExp(filters.title.join('|'), 'i')

                return (listings.filter((listing) => {
                    return ((titlesRegex.test(listing.title)))
                }))
            }

            return listings

        })
    },

    /***
     * Parses the site for a number of pages getting the latest listings for a *category*, applying filters, if any.
     * @param {string} category - The site ecategory to get listings from
     * @param {object} filters - Keys and arrays of strings to filter out
     * @param {number} pages - The number of pages to parse
     * @returns {Promise} - a Promise with an array of all the listings selected
     */
    category: (pages = 1, filters, category) => {

        let downloadedPages = []

        // Escape category part
        category = querystring.escape(category)

        for (let page = 1; page <= pages; page++) {
            downloadedPages.push(request(CLASSIFIEDS_URL + 'category/' + category).then(function (html) {

                let $ = cheerio.load(html)
                let listings = []

                $(SELECTORS.CATEGORY_ITEM).filter(function () {

                    // Get only SALES - Skips BUYS
                    if ($(this).find('.ipsBadge').hasClass('ipsBadge_style2')) {
                        return
                    }

                    let thumbElement = $(this).find(SELECTORS.THUMBNAIL)

                    listings.push({
                        title: $(this).find(SELECTORS.TITLE).text().trim(),
                        price: parseFloat($(this).find(SELECTORS.PRICE).text().replace(',','.').trim()),
                        thumb: thumbElement.attr('data-flickity-lazyload') || thumbElement.attr('data-src'),
                        url: $(this).find(SELECTORS.URL).attr('href'),
                        dateScrapped: new Date(),
                    })

                })

                return listings

            }))
        }

        return Promise.all(downloadedPages).then(function (listings) {

            listings = [].concat.apply([], listings)

            if (Object.keys(filters).length !== 0) {
                let titlesRegex = new RegExp(filters.title.join('|'), 'i')

                return (listings.filter((listing) => {
                    return ((titlesRegex.test(listing.title)))
                }))
            }

            return listings

        })

    },

    /***
     * Returns all available categories in site, useful to parse by category (see insomniac.category())
     * @returns {Promise<categories>}
     */
    listCategories: () => {

        return request(SEARCH_URL).then(function (html) {

            let categories = []
            let $ = cheerio.load(html)

            $('.ipsSelectTree_nodes.ipsHide').find('li > .ipsSelectTree_item').each(function () {
                categories.push({
                    [$(this).attr('data-id')]: ($(this).find('span').text().trim())
                })
            })

            return categories

        })

    }

}

module.exports = insomniac
