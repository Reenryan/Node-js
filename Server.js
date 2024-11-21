const app = require('./app');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config({ path: './config.env' });

// Log environment variables for debugging
console.log(process.env);
console.log(process.env.NODE_ENV);

mongoose.connect(process.env.LOCAL_CON_STR, {
}).then((con) => {
    console.log("DB Connection Successful");
}).catch((error) => {
    console.error("DB Connection Error:", error); // Log the specific error
});

const port = process.env.PORT || 3001;
app.listen(port, () => {
    console.log(`Server has started on port ${port}`);
});
