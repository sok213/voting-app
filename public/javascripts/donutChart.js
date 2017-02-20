var ctx = document.getElementById('pollChart').getContext('2d');
var options = {};
var pollID = document.currentScript.getAttribute('pollID');
var type = 'doughnut';
var voterCount;
var voterList;
var toggled = false;
var previousContent = '<h2 class="page-header header-secondary"><i class="fa fa-pie-chart" aria-hidden="true"></i>Stats</h2>' +
          '<h3 class="sub-header">Total Votes: {{getLength poll.voters}}</h3>' +
          '<div class="chartContainer">' +
           '<canvas id="pollChart"></canvas>' +
          '</div>' +
          '<div class="button-container">' +
            '<a class="btn btn-primary tweet-btn"' + 
              'href="https://twitter.com/intent/tweet?text={{{poll.topic}}}&hashtags=GVPY&url=http://localhost:3000/users/poll/{{{pollID}}}"' +
              'target="_blank">' +
              '<i class="fa fa-twitter" aria-hidden="true"></i>Tweet #GoVoteAndPollYourself' +
            '</a>' +
            '<button type="button" onclick="toggleChart()" class="btn btn-default view-list-btn">View voters list</button>' +
          '</div>';

// Toggle chart type from pie to doughnut button.
function toggleChart() {
  console.log(toggled);
  if(toggled === false) {
    $('#stats-list').html(
      '<h2 class="page-header header-secondary">' + 
        '<i class="fa fa-list-ul" aria-hidden="true"></i>' + 
        'Voters List' +
      '</h2>' +
      
      '<h3 class="sub-header">Total Votes: ' + voterCount + '</h3>' +
      '<div id="list-container">' +
        '<ul id="voters-ul"></ul>' + 
      '</div>' +
      '<div class="button-container">' +
        '<button type="button" onclick="toggleChart()" ' + 
        'class="btn btn-default view-list-btn">Return</button>' +
      '</div>'
    );
    voterList.forEach(function(item) {
      $('#voters-ul').append(item);
    });
  } else {
    $('#stats-list').html(previousContent);
    ctx = document.getElementById('pollChart').getContext('2d');
    renderChart(type);
  }
  
  toggled = toggled === false ? true : false;
}

// Set the data object model for chart.
var data = {
  labels: [],
  datasets: [{
    data: [],
    backgroundColor: []
  }]
};

// Function will render chart with API call.
function renderChart(type) {
  $.ajax({
    async: true,
    url: 'http://localhost:3000/api/' + pollID,
    type: 'GET',
    success: function(json) {
      console.log(json[0]);
      voterCount = json[0].voters.length;
      voterList = json[0].voters.map(function(d) {
        return '<li>' + d.user + ' voted for ' + d.option + '</li>';
      });
      // Set the labels for chart.
      data.labels = json[0].options.map(function(d) {
        data.datasets[0].backgroundColor.push(
          randomColor({luminosity: 'bright',})
        );
        return d.option;
      });
      
      // Set dataset for chart.
      data.datasets[0].data = json[0].options.map(function(d) {
        return d.votes;
      });
      // For a doughnut chart
      var myPieChart = new Chart(ctx,{
          type: type,
          data: data
      });
    }, 
    error: function(err) {
      console.log(err);
    }
  });
}

renderChart(type);