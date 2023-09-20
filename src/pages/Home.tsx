import { contrastOutline, settings, settingsOutline, information } from "ionicons/icons";
import { IonButton, IonButtons, IonContent, IonHeader, IonIcon, IonItem, IonPage, IonSearchbar, IonSelect, IonSelectOption, IonTitle, IonToolbar } from '@ionic/react';
import './Home.css';
import HomeContentContainer from "../components/HomeContentContainer";
import { useContext, useEffect, useState } from "react";
import { AppConfig } from "../SettingContext";

const Home: React.FC = () => {
  const {setting} = useContext(AppConfig)

  useEffect(() => {
    console.log(setting)
  }, [setting])

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          <IonTitle className="ion-text-center ion-text-capitalize" >Weather App</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen className="ion-padding" color="primary">
        <HomeContentContainer setting={setting}/>
      </IonContent>
    </IonPage>
  );
};

export default Home;
