$(function () {
  var digitalsOutputs;

  $("#info").click(function(){
    $("#status_info").text("Sending data...");
    $.get("/info").done(showResults);
    return false; 
  });
  
  $("#doutput").click(function(){
    digitalsOutputs[1] += 1;
    $.get("/writeDOutputs", { dOutputs: digitalsOutputs })
     .done( (data) => {
        console.log(`send data Ok => ${data}`);
      });
    return false; 
  });

  function showResults(data){
    console.log(data);
    var res = JSON.parse(JSON.stringify(data));
    digitalsOutputs = [res["DOY0"], res["DOY1"], res["DOY2"], res["DOY3"], res["DOY4"]];
   
    $("#status_info").removeClass().addClass(res["active"])
    $("#status_info").text(res["active"]); 
    $("#registers_list").append(`<li>${res["DIX0"]} ${res["DIX1"]} ${res["DIX2"]}</li>`);
    $("#registers_list").append(`<li>${digitalsOutputs}</li>`);
  }


});

