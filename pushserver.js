/*
Mahdollisimman yksinkertainen Nodejs push notifikaatio -serveri joka
on toteutettu express -kirjaston avulla. Serveri käynnistyy komennolla
node pushserver tai npm start ja se sammutetaan näppäinyhdistelmällä
control c eli CTRL c
*/

const express = require('express'); // kirjasto jolla luodaan serveri
const webpush = require('web-push'); // kirjasto jossa on web-push notifikaation toteutus
const cors = require('cors'); // kirjasto jota tarvitaan jotta data siirtyy kahden eri palvelimilla olevan sovelluksen välillä
const bodyParser = require('body-parser'); // kirjasto jota tarvitaan webistä tulevan JSON-datan jäsentämiseen

// vapid -keyt joilla varmistetaan että push notifikaatio tulee oikeasta ja turvallisesta lähteestä
// Normaalisti näitä ei kannata turvallisuuden vuoksi kovakoodata tähän vaan kannattaa hakea ulkoisesta tiedostosta 
const publicVapid = 'BNBwFQC2sZUeXgA9g5x4QZYybhX5i5Z5-jiE0psb9RV9JDdHCsg6LG1rZQcQ1hv9YsuoOf61EFxjAt_UfuDUQls';
const privateVapid = '4mlOdqpKcVIvqjaPjOxhZyRORUXHnZQ1PyeOCFzzry4';

// serverin luonti ja middleware -kirjastojen käyttöönotto
const app = express(); // serveri syntyy app -muuttujaan
app.use(cors());
app.use(bodyParser.json());

// annetaan  mailiosoite ja vapid -keyt webpush -oliolle
webpush.setVapidDetails('mailto:omatunnus@jamk.fi', publicVapid, privateVapid);

// reitti joka vastaanottaa notifikaation tilauksen asiakassovelluksesta
app.post('/subscription', (req, res) => {
    const subscription = req.body;
    console.log('Clientilta tuli notifikaation tilaus:');
    console.log(subscription);

    /*
    * Heti kun tilaus tulee, aletaan lähettämään push notifikaatioita
    * kymmenen sekunnin välein. Voitasiin lähettää vain yhden kerran, mutta tässä
    * häiriköidään tarkoituksella jotta havaitaan saapuvat viestit paremmin ;-)
    * Asiakassovelluksen service worker ottaa notificationin vastaan ja esittää sen
    * tietokoneen selaimen oikeassa yläkulmassa tai älypuhelimella näytön alaosassa.
    *
    * Notifikaatio on tässä kovakoodattuna serverissä, mutta normaalisti se haetaan
    * esim. tietokannasta jonne tiedottaja on sen asiakassovelluksen lomakkeen kautta
    * lisännyt.
    */
    setInterval(() => {
        const payload = JSON.stringify({
            notification: {
                title: 'Hei kaikille!',
                body: 'Tämä on tärkeä viesti serveriltä kaikille sovelluksen käyttäjille',
                icon: 'assets/icons/icon-512x512.png',
            },
        });
        webpush.sendNotification(subscription, payload);// tässä tapahtuu notificationin lähetys
        console.log('Lähetettiin push notifikaatio serveriltä');
    }, 10000);
});

// laitetaan serveri porttiin 3000
app.listen(3000, () => {
    console.log('Serveri käynnistyi porttiin 3000');
});
