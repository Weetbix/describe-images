const fs = require('fs');
const request = require('request');

async function describeImages(images, apikey)
{
    var errors = [];
    var descriptions = [];
    for(image of images)
    {
        try
        {
            const response = await describeImage(image, apikey);
            descriptions.push({ file : image, description: response });
        }
        catch(error) {
            errors.push({ file : image, error });
        }
    }
    return { descriptions, errors };
}


// Wrap the request function in a promise
async function describeImage(filepath, apikey)
{
    return new Promise((resolve, reject) =>
    {
        requestSingleImage(filepath, apikey, (err, response) =>
        {
            if(err)
                return reject(err);

            return resolve(response.description.captions[0].text);
        });
    });
}

function requestSingleImage(filepath, apikey, callback)
{
    fs.createReadStream(filepath)
      .pipe(
        request({
            url: 'https://api.projectoxford.ai/vision/v1.0/analyze',
            qs : {
                visualFeatures : 'Description'
            },
            method: 'POST',
            headers: {
                'content-type' : 'application/octet-stream',
                'Ocp-Apim-Subscription-Key' : apikey
            }
        },
        (error, response, body) => {
            if(error)
                return callback(err);

            try {
                return callback(null, JSON.parse(body));
            }
            catch(error){
                callback(error.message);
            }
        })
      );
}

module.exports = {
    describeImages,
    describeImage
};