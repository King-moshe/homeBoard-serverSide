//כל המשתנים המאובטחים יהיו מאוגדים בקובץ אחד
// כגון שם משתמש של מסד, סיסמא של מסד, וסיקרט טוקן
require ('dotenv').config()
exports.config = {
    db_pass: "",
    db_user: "",
    token_secret: process.env.SECRET_TOKEN,
    db_url: process.env.DB_URL
}