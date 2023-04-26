const options = {
    headers: {
        'X-TBA-Auth-Key': 'sBluV8DKQA0hTvJ2ABC9U3VDZunUGUSehxuDPvtNC8SQ3Q5XHvQVt0nm3X7cvP7j'
    }
}

getTBA("https://www.thebluealliance.com/api/v3/events/2023/keys");

function getTBA(url) {
    fetch(url, options)
        .then((response) => response.json())
        .then((json) => {
            console.log(json);
            return(json);
        });
}