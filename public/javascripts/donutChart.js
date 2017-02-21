var ctx = document.getElementById('pollChart').getContext('2d');
var options = {};
var pollID = document.currentScript.getAttribute('pollID');
var type = 'doughnut';
var voterCount;
var voterList;
var toggled = false;
var previousContent = $('#stats-list').html();

// Toggle chart type from pie to doughnut button.
function toggleChart() {
  if(toggled === false) {
    $('#stats-list').html(
      '<h2 class="page-header header-secondary">' + 
        '<i class="fa fa-list-ul" aria-hidden="true"></i>' + 
        'Voters List' +
      '</h2>' +
      
      '<h3 class="sub-header">Total Votes: ' + voterCount + '</h3>' +
      '<div id="list-container">' +
        '<ol id="voters-ol"></ol>' + 
      '</div>' +
      '<div class="button-container">' +
        '<button type="button" onclick="toggleChart()" ' + 
        'class="btn btn-default view-list-btn">' + 
        '<i class="fa fa-angle-left" aria-hidden="true"></i>Return</button>' +
      '</div>'
    );
    voterList.forEach(function(item) {
      $('#voters-ol').append(item);
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
    url: '/api/' + pollID,
    type: 'GET',
    success: function(json) {
      console.log(json[0]);
      voterCount = json[0].voters.length;
      voterList = json[0].voters.map(function(d) {
        return '<li>' + 
          '<a href="/profile/' + d.userId + '">' +
          '<span style="color: rgb(173, 80, 231)">' + d.user + '</span></a>' + 
          ' voted for ' + 
          '<span style="color: rgb(80, 185, 231)">' + d.option + '</span>' + 
          '</li>';
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