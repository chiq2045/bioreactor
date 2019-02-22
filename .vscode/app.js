class EzophClass {
    constructor (i2c, address) {
        this.i2c = i2c;
        this.address = address;
    }

    read() {
        //implement read here
        console.log ('it had read');
        this.i2c.writeTo(this.address, 'R');

        return parsData()

        //reads data
        function getData (callback) {
            return new Promise (resolve => {
             
                setTimeout(() => {
                    resolve (callback);
                }, 900);
            }) ;
        }
        //waits for data to come back
        async function parsData () {
            let ezophData = await getData(this.i2c.readfrom (this.address, 21));

            let strArray = [];
                if (ezophData[0] === 1) {
                    for ( i=1; i<ezophData.lenght; i++) {
                        if (ezophData[i]!==0) {

            strArray.push(String.fromCharCode(ezophData[i]));
                        }
                    }
                }
                return strArray.join('');
            // Testing
            /* let ezophData = await getData('data');
             console.log (ezophData);*/
        }
    }
    
}



let ph = new EzophClass(null, null);
ph.read()