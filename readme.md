Hi guys,

I set up a rough structure for our coding. As I understand, we are using html + css for front end & sql for back end.

Under App > boundary, is mostly where the front end code goes ***frontend***

App > controllers: Link between front end and backend, where some sql code is written. Where the "API" is. Front end code calls the functions in controllers. ***backend***

App > database: usual database config info, usually unchanged. Db name etc found here

App > entity: the objects in our database, some sql code is written ***backend***

This is all a rough structure just based on my previous projects. Please feel free to make changes / discuss if you guys have any other things in mind.

I use xampp (apache, mysql) to test and run the code. Not sure what you guys use, we can discuss as well!

**Code Development**
The  'landing page' for our app for now is App>index.php, which in xampp is accessed by: [http://localhost/fyp/Fyp-23-s3-05-emproster/App/](http://localhost/fyp/Fyp-23-s3-05-emproster/App/) on your local computer.
