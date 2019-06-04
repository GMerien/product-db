$(function(){
    $("form").on("submit", function() {
      if($("input").val().length < 4) {
        $("div.form-group").addClass("has-error");
        $("div.alert").show("slow").delay(4000).hide("slow");
        return false;
      }
    });
  });