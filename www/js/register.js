$( document ).ready(function() {
    let registracija = $('#registracija');
    let form = registracija.closest('form');
    let inputs = form.find('input');
    let action = form.attr('action');
    let method = form.attr('method');
    if(!method)
        method = 'POST';

    registracija.click(function(event){
        event.preventDefault();
        let postObject = {};
        inputs.each(function( index ) {
            if($(this).attr('type') == 'file'){
                postObject[$(this).attr('name')] = $(this)[0].files[0];
            } 
            else if($(this).attr('type') == 'checkbox'){
                postObject[$(this).attr('name')] = $(this).prop('checked');
            } else {
                postObject[$(this).attr('name')] = $(this).val();
            }
        });
        var formData = new FormData();
        for ( var key in postObject ) {
            formData.append(key, postObject[key]);
        }
        $.ajax({
            method: method,
            url: action,
            data: formData,
            processData: false, 
            contentType: false
        })
        .done( ( msg, textStatus, xhr ) => {
            console.log(xhr);
            $.toast({
                heading: 'Information',
                text: 'User registrated successfully',
                showHideTransition: 'slide',
                icon: 'info'
            })
            window.location.replace($('#redirect').html());
        })
        .fail( (err) => {
            console.log(err);
            $.toast({
                heading: 'Warning',
                text: err.responseText,
                showHideTransition: 'slide',
                icon: 'warning'
            })
        });
    });

});