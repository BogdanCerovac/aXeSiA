# aXeSiA

![aXeSiA logo - just text with custom font, looking like it was drawn by hand](https://github.com/BogdanCerovac/aXeSiA/blob/main/srv/public/res/aXeSiA-logo.png?raw=true)

## What is aXeSiA?

### Let's start with the name, shall we:
I like to pronounce it as "accessia" but the idea for the name comes from two mayor accessibility tools I use a lot: Deque's axe and Siteimprove's Alfa. So aXeSiA is a kind of a word game combining those two softwares into a single word - plus at the same time trying to be related to accessibility ("accessia").

### What is it supposed to do:

Using browser extensions like axe and Siteimprove and other tools is a part of any accessibility testing and audit. So I was always thinking about simple and free automation of these tests. Luckily majority is open sourced but I wanted more - I wanted to run multiple different tests at the same time and unify their results in a simple way. That's what I think can give more value as it can be easily determined which pages have more potential failures and which not.

As known - automatic tools can only get you to a point but they may give a good indication about where to start auditing manually. At the same time regressions can happen and it is smart to have a simple way to monitor historical development of failures, passes and so on.

And there was also the idea of monitoring search engine optimization (SEO), performance and other indications that can be added so easily with modern open sources tools out there. They are not related to accessibility but still very useful when thinking of overall page status.

Open source, automatic auditing of accessibility (and other measurable parameters like SEO and performance) in bulk. 
So main requirements I wanted to achieve with aXeSiA are:
- simple cookie consent manipulation (as they can get in way for screen-shots and even other audits)
- making screenshots of multiple screen resolutions and orientations (useful for accessibility and UI testing),
- accessibility evaluation based on multiple different implementations of Accessibility Conformance Testing (ACT) rules (currently Deque's axe and Siteimprove's Alfa),
- running a full Google's Lighthouse audit and getting SEO, Performance and Best practice scores (as they use axe for accessibility I did not focus on that part).

## axe-hackaton 2021 and beyond

I've been thinking of aXeSiA long before axe-hackaton 2021 but when I attended axe-con I thought it would be interesting to really do something there. And because axe-core is one of the most important parts it felt natural. It was unfortunately not possible to present aXeSiA on the hackaton due to a family emergency, so I did not pitch it there and that is probably also the reason why there are no other contributors (for now at least). But it's OK. I made a simple and working proof of concept and reached the first goal.

[Simple video presentation and demo (manually captioned)](https://youtu.be/c2ICfeuM8HE)

### Basic features for axe-hackaton - minimum viable product

Due to time limitations I've decided to limit the scope to bare minimum and concentrate on functionality before other aspects. So code is dirty, design is extremely raw and I tried to make the user interface accessible but it is far from performant and needs a lot more work. But main features work and can be already used.

aXeSiA can:

- parse sitemap.xml and save all URLs to a list,
- disable cookie consent overlays so that they are not in way - simple click on accept all / refuse all implemented,
- loop through the list of all URLs and process following tasks:
    - per page - save screenshots of a page with different resolutions and orientations,
    - per page - generate and save aXe core accessibility report and build site-wide summary,
    - per page - generate and save Siteimprove alfa report and build site-wide summary,
    - per page - generate and save Lighthouse report (SEO, best practices and performance) and build site-wide summary,
    - per page - generate and save Page complexity report (based on weighted HTML elements and JavaScript events) and build site-wide summary,

- simple web user interface with overview of:
    - overall accessibility, SEO, performance and complexity for whole domain (averages of all sites at once),
    - possibility to monitor accessibility, SEO, performance and complexity overall status in time (comparing data)

### Update 9. apr. 2021 from axe-hackaton:

aXeSiA did not won the hackathon and I was also not expecting it to win as there were much more interesting projects but I am happy I was able to present it anyway.
My plan with aXeSiA is to have a simple and open tool that I can use (and happily share with others) for some grunt multi-site audits and will continue to add features as I will see fit (or potential other contributors). It has already saved me some time when I needed to quickly map site-wide situations.

(More info about whole axe-hackathon and a transcript of questions and answers)[https://cerovac.com/a11y/2021/04/axe-hackathon-2021-axesia-questions-answered-and-feedback-from-committee/]

## Used technologies

Standing on the shoulders of giants - aXeSiA would not be possible without amazing efforts, for example:
- Deque's axe for accessibility auditing (https://github.com/dequelabs/axe-core),
- Siteimprove alfa for accessibility auditing (https://github.com/Siteimprove/alfa),
- Google Lighthouse for SEO, Performance and best practice auditing (https://github.com/GoogleChrome/lighthouse),
- Puppeteer for running and controlling headless browser and getting screenshots (https://github.com/puppeteer/puppeteer),
- NodeJS for running back-end and serving reporting (https://nodejs.org/),
- ExpressJS for serving handlebars and web user interface (https://expressjs.com/),
- Handlebars for templates (https://github.com/express-handlebars/express-handlebars),
- Better SQLite3 for local persistent storage (https://github.com/JoshuaWise/better-sqlite3),
- D3js for donut and histogram charts (https://github.com/d3/d3),
- and others (please refer to https://github.com/BogdanCerovac/aXeSiA/blob/main/package.json for dependencies)

## Additional features that could be added-on - include but are not limited to;
- accessibility regression testing - to follow up on issues continuously,
- accessibility object model simulation and analysis - to try to catch problematic parts for assistive tech in advance,
- statistical analysis and reporting - to follow up on a higher level and to prevent similar issues in development,
- project management integration - for example Jira and MS DevOps bug reports,
- User interface regression testing - screenshot comparator++ 

## Next steps

Please note that I do not have much capacity in regards of feature requests but I will do my best to fix eventual bugs. Pull requests are welcome.

Please read more about aXeSiA on my blog: https://cerovac.com/a11y/2021/04/my-first-axe-hackaton-with-my-axesia-my-first-contribution-to-accessibility-open-source/

## More info

- [Please read about terms and conditions - no warranty and do check if you can crawl a page before you do it!](https://github.com/BogdanCerovac/aXeSiA/wiki/Terms-and-conditions)
- [Wiki page (some additional details, installation and usage)](https://github.com/BogdanCerovac/aXeSiA/wiki)
- [How to contribute](https://github.com/BogdanCerovac/aXeSiA/blob/main/CONTRIBUTING.md)
- [Security concerns or vulnerabilities?](https://github.com/BogdanCerovac/aXeSiA/blob/main/SECURITY.md)
- [Code of conduct](https://github.com/BogdanCerovac/aXeSiA/blob/main/CODE_OF_CONDUCT.md)
- [License: Mozilla Public License 2.0](https://github.com/BogdanCerovac/aXeSiA/blob/main/LICENSE)

