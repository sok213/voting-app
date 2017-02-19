var ctx = document.getElementById('pollChart').getContext('2d');
var options = {};
var pollID = document.currentScript.getAttribute('pollID'); //1
var type = 'pie';

var data = {
  labels: [],
  datasets: [{
    data: [],
    backgroundColor: ['rgb(76, 210, 93)', 'rgb(55, 158, 195)', 'red', 'blue', 'green', 'black', 'orange', 'pink'],
    hoverBackgroundColor: []
  }]
};

// Function will render chart with API call.
function renderChart(type) {
  $.ajax({
    url: 'http://localhost:3000/api/' + pollID,
    type: 'GET',
    success: function(json) {
      console.log(json[0]);
      // Set the labels for chart.
      data.labels = json[0].options.map(function(d) {
        return d.option;
      });
      
      // Set dataset for chart.
      data.datasets[0].data = json[0].options.map(function(d) {
        return d.votes;
      });
      
      console.log('creating chart');
      // For a doughnut chart
      var myPieChart = new Chart(ctx,{
          type: type,
          data: data,
          options: options
      });
    }
  });
}

renderChart(type);

// Toggle chart type from pie to doughnut button.
function toggleChart() {
  type == 'pie' ? type = 'doughnut' : type = 'pie';
  renderChart(type);
}

console.log('data: ', data);