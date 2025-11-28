# Delivery Staging OCR App

This is an app used for verifying model and serial numbers on appliances that are staged for the next day's deliveries. It uses Optical Character Recognition (OCR) to verify the product and stores the serial number in a Firebase database, showing real-time data.

The app used bolt.new to AI generate the layout. The logic has been adapted for a household appliance company.

A large excel file of inventory needs to be uploaded to localStorage before model and serial numbers can be verified. Previous dates lists can be viewed even without uploading the inventory excel file.

After selecting an item and taking a photo, the app compares the locally stored inventory list with the OCR text; comparing the two arrays. When it finds a matching serial number it is saved to the database.

app link: staginglist.netlify.app

**For Testing** 

The test staging list file is "short list for testing OCR.xlsx". the dates are 10/31/25. To see the list populate, set the date to 10/31/25.

The inventory excel upload file is "Stock Test File.xlsx"

Use appliance tags in the testing_data folder for OCR testing