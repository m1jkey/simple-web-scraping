'use strict';
const req = require('request');
const cheerio = require('cheerio');
const eventproxy = require('eventproxy');
const url = require('url');

const scrapUrl = 'https://cnodejs.org';

req(scrapUrl, (err, res, html) => {
    if (err) return console.log(err);

    let topicUrls = [];
    let $ = cheerio.load(html);

    $('#topic_list .topic_title').each((i, el) => {
        let $el = $(el);
        let href = url.resolve(scrapUrl, $el.attr('href'));
        topicUrls.push(href);
    });

    console.log(topicUrls);
    let ep = new eventproxy();

    ep.after('topic_html', topicUrls.length, (topics) => {
        topics = topics.map((topic) => {
            let topicUrl = topic[0];
            let topicHtml = topic[1];
            let $ = cheerio.load(topicHtml);

            return ({
                title: $('.topic_full_title').text().trim(),
                href: topicUrl,
                comment: $('.reply_content').eq(0).text().trim()
            });
        });

        console.log('final');
        console.log(topics);
    });

    topicUrls.forEach((topicUrl) => {
        req(topicUrl, (err, res, body) => {
            console.log('fetch ' + topicUrl + ' successful');
            ep.emit('topic_html', [topicUrl, body]);
        });
    });
});
