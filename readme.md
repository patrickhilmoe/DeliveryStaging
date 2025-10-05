# OCR Appliance Model and Serial Number Scanner

notes:
layout - sort lines based on name & location

layout - add upload excel to add to firebase db
logic - test data to put in firebase db to use in app
logic - connect to Firebase db and create new collection name.date (firestore Timestamp?) - got it to work in secondary app
        map over array object, giving id to each line to fit structure for db
    check if model number matches, if true upload serial number that matches the TSstock file
    if serial number is not in the photo or doesn't match, prompt to take another photo

logic/layout - how to add indiviual line updates? 

layout - button dropdown to look at past days
logic - update layout depending on date. default current date.