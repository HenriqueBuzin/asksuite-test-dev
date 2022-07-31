const puppeteer = require('../services/BrowserService');
const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.send('Hello Asksuite World!');
});

router.post('/', (req, res) => {
    (async () => {
        try {
            
            // Accommodation requires a minimum of 3 nights
            let checkin = req.body.checkin;
            checkin = checkin.replaceAll("-", "%2F");
 
            let checkout = req.body.checkout;
            checkout = checkout.replaceAll("-", "%2F");
            
            const url = `https://pratagy.letsbook.com.br/D/Reserva?checkin=${checkin}&checkout=${checkout}&cidade=&hotel=12&adultos=2&criancas=&destino=Pratagy+Beach+Resort+All+Inclusive&promocode=&tarifa=&mesCalendario=6%2F14%2F2022`;

            const browser = await puppeteer.getBrowser();
            
            const page = await browser.newPage();

            await page.goto(url);  

            await page.waitForSelector("tr.row-quarto");

            const data = await page.evaluate(() => {

                const list = [];

                const items = document.querySelectorAll("tr.row-quarto");

                for (const item of items) {

                    list.push({
                        name: item.querySelector('span.quartoNome').innerHTML,
                        description: item.querySelector('div.quartoDescricao > p').innerHTML,
                        price: item.querySelector('span.valorFinal').textContent.replace(/ +(?= )/g,''),
                        image: item.querySelector('img.room--image').getAttribute('data-src')
                    });

                }

                return list;

            })

            console.log(data);
 
            await puppeteer.closeBrowser(browser);
    
            res.send(data);
           
        } catch(e) {
            console.log(e);
        }
    })();
});

module.exports = router;
