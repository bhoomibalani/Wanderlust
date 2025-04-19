const User = require("../models/user.js"); 
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

//email verification
const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
    
});

module.exports.verifyEmail = async (req, res) => {
    const { token } = req.query;

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findOne({ email: decoded.email });

        if (!user) {
            req.flash("error", "User not found.");
            return res.redirect("/signup");
        }

        user.verified = true;
        await user.save();

        req.flash("success", "Email verified! You can now log in.");
        res.redirect("/login");

    } catch (err) {
        req.flash("error", "Invalid or expired verification link.");
        res.redirect("/signup");
    }
};

module.exports.signup = async (req, res) => {
    try {
        let { username, email, password } = req.body;
        const newUser = new User({ email, username });

        const registeredUser = await User.register(newUser, password);

        // Generating token AFTER registering user
        const token = jwt.sign(
            { email: registeredUser.email },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        const verificationLink = `http://localhost:3000/verify?token=${token}`;

        // Logs
        console.log("✅ About to send verification email...");
        console.log("📨 Sending to:", registeredUser.email);
        console.log("🔗 Verification link:", verificationLink);
        console.log("📥 From email:", process.env.EMAIL_USER);
        console.log("🔐 Email pass loaded?", process.env.EMAIL_PASS ? "✔️ Yes" : "❌ No");

        // Transporter verify check
        await transporter.verify();
        console.log("✅ Transporter is ready to send emails.");

        // Actually send the email
        const info = await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: registeredUser.email,
            subject: "Verify your Wanderlust email",
            html: `<p>Hi ${username},</p><p>Please verify your email by clicking <a href="${verificationLink}">here</a>.</p>`
        });

        console.log("✅ Email sent!");
        console.log("📬 Message ID:", info.messageId);

        req.flash("success", "Signup successful! Check your email to verify your account before logging in.");
        res.redirect("/login");

    } catch (e) {
        console.error("❌ Error during signup:", e);
        req.flash("error", e.message);
        res.redirect("/signup");
    }
}


       
 
module.exports.renderSignupForm=(req, res) => {
    res.render("users/signup.ejs");
}

module.exports.renderLoginForm=(req, res) => {
    res.render("users/login.ejs")
};
module.exports.login=async (req, res) => {

    if(!req.user.verified){
        req.logout(()=>{
            req.flash("error", "Please verify your email before logging in.");
            res.redirect("/login");
        });
        return;
    }
    req.flash("success", "Welcome to Wanderlust ! You are logged in");
    let redirectUrl=res.session.returnTo || "/listings";
    delete req.session.returnTo;
    res.redirect(redirectUrl);
}

module.exports.logout=(req, res, next) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        req.flash("success", "you are logged out!!");
        res.redirect("/listings");
    })
}