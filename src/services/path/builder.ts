import Signal from "../../models/Signal";

class PathBuilder {
    public static build(signals: Signal[]) {
        const data: any[] = signals.map((signal) => signal.dataValues);

        return data.reduce((res, curr) => {
          const path = curr.path.split(".")
      
          for (let i = 0; i < path.length; i++) {
            let temp: any = res;
            for (let j = 0; j <= i; j++) {
              let key = path[j];
              if (!temp[key]) {
                const data = { ...curr }
                delete data.path
                temp[key] = (j === path.length - 1) ? data : {};
              }
              temp = temp[key];
            }
          }
      
          return res
        }, {})
    }
}

export default PathBuilder