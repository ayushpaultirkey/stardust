import mysql from "mysql";
import "dotenv/config";

const MySQL = {
    Connection: class {
        constructor(url = (process.env.DATABASE_URL || "mysql://root:@localhost:3306/stardust")) {

            this.connection = mysql.createConnection(url);
            this.Observe = { Enabled: false, Index: 1 };
        
        }
        Connect() {
    
            return new Promise((resolve, reject) => {
    
                this.connection.connect((error) => {
            
                    if(error) {
                        reject(`Unable to connect to database${(this.Observe.Enabled) ? `\nError at step: ${this.Observe.Index}\n` : ""}`);
                        return false;
                    };
                    resolve(true);
                    this.Observe.Index++;
            
                });
        
            });
    
        }
        Query(query = "", parameter = []) {
            
            return new Promise((resolve, reject) => {
    
                const _query = this.connection.format(query, parameter);

                this.connection.query(_query, (error, result) => {
                    
                    if(error) {
                        reject(`Unable to perform query ${(this.Observe.Enabled) ? `\nError at step: ${this.Observe.Index}` : error.message}`);
                        return false;
                    };
                    resolve(result);
                    this.Observe.Index++;
            
                });
        
            });

        }
        Close() {
            this.connection.end();
        }
    }

};

export default MySQL;