import { Database } from "bun:sqlite";

const db = new Database("opters.sqlite");

db.run("create table if not exists gamerings (user_id text, opted_in boolean);");

function changeMoney(user_id: string, amount: number) {
    let stmt = db.query("select * from gamerings where user_id = ?");
    let rows = stmt.all(user_id);
    if (rows.length > 0) {
        // update
        db.run("update gamerings set money = money + ? where user_id = ?", [
            amount,
            user_id
        ]);
    }
    else {
        // insert
        db.run("insert into gamerings (user_id, money) values (?, ?)", [
            user_id,
            amount
        ]);
    }
}

function getMoney(user_id: string): number {
    let stmt = db.query("select * from gamerings where user_id = ?");
    let rows = stmt.all(user_id);
    if (rows.length > 0) {
        return (rows[0] as any).money;
    }
    else {
        return 0;
    }
}

console.log('joe has', getMoney('joe'), 'dollar');
changeMoney('joe', 10);
console.log('joe has', getMoney('joe'), 'dollar');