

Process of main.js  
  step#1 listen events of ethereum and Polygon 
  step#2 after completion of step#1 , fetch apis process starts for both ethereum and polygon
  step#3 after completion of step#2 , fetch data from the database and write the two seperate csv files for both ethereum and polygon



  step#4 after completion of step#3 , if you have any other files which data want to update in the existing databae then convert it and give the path and name of file to UpdateDataExcelToDB which is placed in the main.js file 
  step#5 after completion of step#4 , this function will put data from csv to the database.


  step#5 if you want to get the complete csv including step#4 and step#5 then uncomment the code place in the csvUtils.js file then execute the file it will get all columns of database and write into the csv file.



  Thanks 