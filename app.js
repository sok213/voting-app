// Retrieve modules.
const express   = require('express'),
  mongoose      = require('mongoose'),
  router        = express.Router(),
  path          = require('path'),
  bodyParser    = require('body-parser'),
  expressValid  = require('express-validator'),
  session       = require('express-session'),
  handleBars    = require('express-handlebars'),
  app           = express(),
  config        = require('./config'),
  passport      = require('passport'),
  cookieParser  = require('cookie-parser'),
  flash         = require('connect-flash'),
  apiController = require('./controllers/apiController'),
  port          = 3000,
  // Connect to the mLab database via the mLab URI from config.js file.
  db            = mongoose.connect(config.getDbConnectionString());

// Retrieve routes.
const routes = require('./routes/index'),
  users      = require('./routes/users'),
  poll       = require('./routes/poll'),
  profile    = require('./routes/profile');

// Set views and view engine to HandleBars.
app.set('views', path.join(__dirname, 'views'));
app.engine('handlebars', handleBars({defaultLayout: 'layout'}));
app.set('view engine', 'handlebars');

// Set bodyParser module. 
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

// Set the assets folder.
app.use(express.static(path.join(__dirname, 'public')));

// Sets Bootstrap and jQuery.
app.use('/js', express.static(__dirname + '/node_modules/bootstrap/dist/js'));
app.use('/js', express.static(__dirname + '/node_modules/jquery/dist')); 
app.use('/css', express.static(__dirname + '/node_modules/bootstrap/dist/css'));
// Set randomColor.js.
app.use('/randomColor', express.static(__dirname + '/node_modules/randomcolor'));

// Set module folder 
app.use('/font-awesome', express.static(__dirname + 
  '/node_modules/font-awesome'));

// Configure session module.
app.use(session({
  secret: 'secret',
  saveUninitialized: true,
  resave: true
}));

// Configure passport module.
app.use(passport.initialize());
app.use(passport.session());

// Configure express-validator module.
app.use(expressValid({
  errorFormatter: (param, msg, value) => {
      let namespace = param.split('.')
      , root    = namespace.shift()
      , formParam = root;

    while(namespace.length) {
      formParam += '[' + namespace.shift() + ']';
    }
    return {
      param : formParam,
      msg   : msg,
      value : value
    };
  }
}));

// Set flash module.
app.use(flash());

// Sets local variables to be used with HandleBars views.
app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  res.locals.user = req.user || null;
  res.locals.title = 'GoVote&PollYourself';
  res.locals.capitalize = (title) => {
    let firstName = title.split(' ')[0];
    return firstName.split('')[0].toUpperCase() + firstName.substring(1);
  };
  res.locals.getLength = (voters) => {
    return voters.length;
  };
  next();
});

// Set routes.
app.use('/', routes);
app.use('/users', users);
app.use('/users', poll);
app.use('/profile', profile);

// Serve app to apiController module which will listen to any 
// request on /api/:pollID
apiController(app);

// 404 error handler.
app.get('*', function(req, res){
  res.render('404');
});

// Start server.
let server = app.listen(port, () => console.log('Listening on port: ', port));
