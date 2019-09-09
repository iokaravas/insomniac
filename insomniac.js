const request = require('request-promise-native')
const cheerio = require('cheerio')
const querystring = require("querystring")

const DOMAIN = 'http://www.insomnia.gr/'
const CLASSIFIEDS_URL = DOMAIN + 'classifieds/'
const SEARCH_URL = CLASSIFIEDS_URL + 'search/?type=classifieds_advert'

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

                $('.classifieds__latest .entry').each(function () {
                    let thumbElement = $(this).find('.classified__photo a img')
                    listings.push({
                        title: $(this).find('.title h3').text().trim(),
                        price: $(this).find('.classified__photo .price span').text().trim(),
                        thumb: thumbElement.attr('data-flickity-lazyload') || thumbElement.attr('data-src'),
                        url: $(this).find('.title h3 a').attr('href'),
                        date: ''
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

                $('.ipsDataItem').filter(function () {

                    // Get only SALES
                    if ($(this).find('.ipsBadge').hasClass('ipsBadge_style2')) {
                        return
                    }

                    listings.push({
                        title: $(this).find('.ipsDataItem_title a').text().trim(),
                        price: $(this).find('.cFilePrice').text().trim().replace(/\D/g, ""),
                        thumb: $(this).find('img').attr('src'),
                        date: $(this).find('time').attr('datetime'),
                        url: $(this).find('.ipsDataItem_main').find('a').attr('href')
                    })

                })

                return listings

            }))
        }

        return Promise.all(downloadedPages).then(function (listings) {

            listings = [].concat.apply([], listings)

            if (filters.title.length !== 0) {
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