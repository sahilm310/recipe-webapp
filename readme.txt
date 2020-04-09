I believe i have completed all requirements, the users can only update and delete their own recipes, done this through req.session.userId



#requirements 
1. It is a Node.js app - index.js
2. There is a home page with links to all other pages - views/index.html - ln12
3. There is a register page - views/register.html
4. There is user authentication page (i.e. logins) - views/login.html
5. There is an add recipe page (available only to logged in users) for each recipe store at least three items: name of the recipe, text of the recipe and the name of the user who created/added the recipe. - views/addrecipe.html
6. There is an update recipe page (available only to logged in users) - views/update.ejs
7. There is a delete recipe page (available only to logged in users) - views/delete.ejs
8. There is a list page, listing all recipes and the name of the user who added the recipe - views/list.ejs - ln29
9. The forms have some validations - routes/main.js - ln47, ln167
10. There are useful feedback messages to the user - routes/main.js - ln84, ln120, ln141 etc.
11. It has a database backend that implements CRUD operations (the database can be MySQL or Mongodb) - routes/main.js - ln62, ln74, ln273 etc.
12. The create & update operations take input data from a form or forms (available only to logged in users) - routes/main.js - ln164, ln176  ln209,ln225
13. The login process uses sessions - route/main.js - ln119
14. Passwords should be stored as hashed - route/main.js - ln71+79
15. There is a way to logout - route/main.js - ln136
16. There is a basic api i.e. recipes content can be accessed as json via http method, It should be clear how to access the api (this could include comments in code) - route/main.js - ln342
17. There are links on all pages to home page providing easy navigation for users - views/index.html, register.html, login.html, addrecipe.html, list.ejs, update.ejs, delete.ejs …….etc. - ln12(roughly for all) 


Database = recipebank
collection = recipes =>  | name      | time     | difficulty | ingredients | method   | publisher | userAuth* |
collection = users =>    | firstname | lastname | email      | username*   | password |
recipes.userAuth = users.username
// used this for the update/delete access
