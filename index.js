const path = require('path');
const dotenv = require('dotenv')
const express = require('express');
const port = 2000;
const app = express();
const cookie_parser = require('cookie-parser');


dotenv.config({
    path:'./.env' 
})


app.set('view engine', 'hbs');
app.use(express.urlencoded(
    {
        extended: true
    }
))
app.use(express.json());
app.use(cookie_parser());

//define the routes
app.use('/', require('./routes/register_routes'));
app.use('/auth', require('./routes/auth'));
app.use('/', require('./routes/login_routes'));

app.listen(port, () => {
    console.log('Server has started');
    // db.connect((error) =>{
    //     if(error){
    //         console.log(`Error: ${error}`);
    //     }
    //     else {
    //         console.log('Database Connected');
    //     }
    // });
});
