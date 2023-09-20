import { createContext } from "react";

export const AppConfig = createContext({
    'setting': {
        'apiKey': 'd0803559f03dafe4ee9b2515f4dc8c21',
        'language': 'en',
        'metric': 'standard',
        'user': {
            'auto_refetch': true,
            'fetch_interval': 300000
        }
    },
    'setSettings': (e: any) => {}
  }) 