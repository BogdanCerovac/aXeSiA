# aXeSiA

![aXeSiA logo - just text with custom font, looking like it was drawn by hand](https://github.com/BogdanCerovac/aXeSiA/blob/main/srv/public/res/aXeSiA-logo.png?raw=true)

Make use of open source to achieve simple, site-wide, accessibility evaluation based on multiple different implementations of Accessibility Conformance Testing (ACT) rules.

Main project page: https://github.com/BogdanCerovac/aXeSiA/projects/1

## aXeSiA - my part in axe-hackaton 2021 - project description

aXeSiA will provide an open source framework based on other open source projects that will provide a basis for other modules and features.

Additional features that could be added-on include but are not limited to;
- accessibility regression testing - to follow up on issues continuously,
- accessibility object model simulation and analysis - to try to catch problematic parts for assistive tech in advance,
- statistical analysis and reporting - to follow up on a higher level and to prevent similar issues in development,
- project management integration - for example Jira and MS DevOps bug reports,
- User interface regression testing - screenshot comparator++ 
 
Due to limited time of the hackaton we will focus on the aXeSiA framework basis first and try to make a minimal viable product with basic features that runs in the terminal (command line interface).

Team number can vary but in the first part we will focus on the command line interface. User Interface & Experience design and development, statistic data analysis / machine learning / database / additional plugins / DevOps / project management can also be started in parallel so it is a matter of discussion.

Git repository: https://github.com/BogdanCerovac/aXeSiA

License: Mozilla Public License 2.0


## Minimum viable product - command line tool based on Puppeteer - axe-hackaton basics
- ~~parse sitemap.xml and save all urls to a list~~,
- ~~disable cookie consent overlays so that they are not in way - difficult to cover different providers, simple click on accept all implemented~~,
- ~~loop through the list and process different tasks~~:
    - per page - ~~save screenshots of a page with different resolutions and landscapes~~ - for visual regression testing and for accessibility,
    - per page - ~~generate and save aXe core accessibility report~~,
    - per page - ~~generate and save Lighthouse report (accessibility and also others, like performance)~~,
    - per page - ~~generate and save Siteimprove alfa report~~
- ~~simple UI with overview of~~:
    - ~~overall accessibility for whole page~~,
    - ~~possibility to monitor changes in time~~
