# *DIPLOMSKI RAD*
*Primena blokčejn tehnologije i OAuth2.0 protokola za siguran prenos novca u veb aplikaciji*

Pre pokretanja aplikacije, neophodno je instalirati softver sa sledećeg linka: https://www.docker.com/ 
Nakon instalacije, otvoriti cmd, pozicionirati se u folder u kome se nalazi yaml fajl i izvršiti naredbu 'docker-compose up'.
Ovim će se pokrenuti kontejneri neophodni za rad aplikacije - server (engine), postgres baza podataka i adminer.

Frontend aplikacije nalazi se u folderu ui. Ovaj folder je potrebno otvoriti u Visual Studio Code-u, zatim izvršiti naredbu 'npm install' kako bi se instalirali svi neophodni moduli, a potom naredbom 'npm start' pokrenuti aplikaciju.
Aplikacija se pokreće na http://localhost:3000, a predloženi pregledač za pokretanje je Google Chrome.

Kako bi bio moguć prenos transakcija, neophodno je imati Keplr Wallet ekstenziju, koja se može instalirati putem sledećeg linka: https://www.keplr.app/download.

