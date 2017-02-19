var ctx = document.getElementById('pollChart').getContext('2d');
var options = {};
var pollID = document.currentScript.getAttribute('pollID'); //1
var type = 'doughnut';

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
    url: 'http://localhost:3000/api/' + pollID,
    type: 'GET',
    success: function(json) {
      console.log(json[0]);
      // Set the labels for chart.
      data.labels = json[0].options.map(function(d) {
        data.datasets[0].backgroundColor.push(randomColor());
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
          data: data
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