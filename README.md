Project Name: Neighborhood Map

Author: Harini Anand

Date: 12/28/2015

Prerequisites:
==============
1. Download this project (Neighborhood Map) from github
URL: https://github.com/harinikanand/NeighborhoodMap

Instructions to view the Neighborhood Map:
=========================================
1. Open the folder containing the project
2. Locate the index.html file in the folder
3. Double click on the index.html 
4. Alternately, you could also open a google chrome browser 
and drag and drop the index.html in the folder on to it.

Description:
============
As part of the neighborhood Map project, I implemented a Map to display the various forest preserves 
areas in Chicago area. Opening the index.html will display a page that on the left hand shows the list
of locations (forest preserve areas) along with a filter/search option, in the middle a chicago area Map 
and to the right two boxes that are stacked and they display the wikipedia and yelp reviews of the forest
preserve area selected and others attractions near it respectively.

The filter option enables user to enter characters based on the locations in the list view are filtered. 
At the same time, the map in the middle is updated to only show the filtered locations along with 
infoWindow showing address, latitude, longitude and a streetview image.


Clicking on item in the list updates the map view to only show the selected location with infoWindow 
opened displaying the address, latitude, longitude and a streetview image. The marker is shown with a 
BOUNCE animation. It also shows the relevant wikipedia and yelp reviews about the location and other 
attractions near it on the right hand side.

Additionally, clicking on a marker on the map changes the marker color (from green to blue) and shows 
the infoWindow displaying the address, latitude, longitude and a streetview image of location that is 
represented by the marker that is clicked. It also shows the relevant wikipedia and yelp reviews about
the location and other attractions near it on the right hand side.



Sources and References:
1. Background image: http://wallpaperswide.com/download/dirt_road_through_forest-wallpaper-1280x800.jpg
2. Chicago area forest preserves: google search results
3. Google Maps & Knockout js: http://jsfiddle.net/rniemeyer/FcSmA/
                              http://www.hoonzis.com/knockoutjs-and-google-maps-binding/
                              http://jsfiddle.net/Wt3B8/23/                             
4. Google streetview image: https://support.google.com/fusiontables/answer/2796058?hl=en
5. Wikipedia reviews (geosearch): https://www.mediawiki.org/wiki/API:Showing_nearby_wiki_information
6. Yelp reviews: http://forums.asp.net/t/1801674.aspx?how+to+create+API+URL+using+some+credentials
                 https://www.yelp.com/developers/documentation/v2/search_api
                 https://github.com/brettdavis4/udacity_js_design_patterns/blob/master/final/js/yelp.js

Important Note: For some forest preserve areas, there is no street view image available.