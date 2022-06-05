import { useState} from "react";
import { IonCard, IonCol, IonContent, IonGrid, IonIcon, IonItem, IonInput, IonSelect, IonSelectOption, IonRow, } from '@ionic/react';
import { closeOutline, saveOutline } from 'ionicons/icons';

import axios from 'axios';

const AddComponent = props => {
     const [addName,setAddName] = useState("");
     const [addURL,setAddURL] = useState("");
     const [addCategoryID,setAddCategoryID] = useState(null);

     const closeAddLink = () => {
          props.setIsAdding(false);
     }

     const saveNewLinkClickHandler = async () => {
          if (addName === "") {
               props.showModalDialog("Please enter the name");
               return;
          }

          if (addURL === "") {
               props.showModalDialog("Please enter the URL");
               return;
          }

          if (addCategoryID === null) {
               props.showModalDialog("Please select the category");
               return;
          }

          await axios.put(`${props.backendURL}/AddLink?Name=${addName}&URL=${addURL}&LinkCategoryID=${addCategoryID}&UserID=${props.currentUserID}`,null,{ headers: {"Authorization" : `Bearer ${props.authKey}`}})
          .then(res=> {
               if (res.data === "") {
                    props.getURLs();
                    props.setIsAdding(false);
               } else {
                    props.showModalDialog(`An error occurred adding the link ${(typeof res !== 'undefined' && res[0] !== "OK" ? `with the error ${res[1]}` : "")}`);
               }
          })
          .catch(err=> {
               props.showModalDialog(`An error occurred adding the link with the error ${err}`);
          })
     }

     const setNewAddNameClickHandler = (event) => {
          const newAddName=event.target.value;
          
          if (typeof newAddName !== 'undefined')
               setAddName(newAddName);
     }

     const setNewAddURLClickHandler = (event) => {
          const newAddURL=event.target.value;
          
          if (typeof newAddURL !== 'undefined')
               setAddURL(newAddURL);
     }

     const setNewAddCategoryChangeHandler = (event) => {
          const newAddCategoryID=event.target.value;
          
          if (typeof newAddCategoryID !== 'undefined')
               setAddCategoryID(newAddCategoryID);
     }

     const linkCategories=props.linkCategories.filter(category => category.LinkCategoryName !== "All");
     
     return (
          <IonContent className="dashed-border">
               <IonCard>
                    <IonGrid>
                         <IonRow>
                              <IonCol size="11">
                                   <IonIcon icon={saveOutline} className="icon clickable" onClick={saveNewLinkClickHandler}></IonIcon>
                              </IonCol>
                        
                              <IonCol size="1">
                                   <IonIcon icon={closeOutline} className="icon clickable" onClick={closeAddLink}></IonIcon>
                              </IonCol>
                         </IonRow>

                         <IonRow>
                              <IonCol size="4">
                                   <IonItem>Name</IonItem>
                              </IonCol>
                         
                              <IonCol size="8">
                                   <IonInput className="dashed-border" type="text" value={addName} onIonChange={setNewAddNameClickHandler} />
                              </IonCol>
                         </IonRow>

                         <IonRow>
                              <IonCol size="4">
                                   <IonItem>URL</IonItem>
                              </IonCol>
                              
                              <IonCol size="8">
                                   <IonInput className="dashed-border" type="text" value={addURL} onIonChange={setNewAddURLClickHandler} />
                              </IonCol>
                         </IonRow>

                         <IonRow>
                              <IonCol size="4">
                                   <IonItem>Category</IonItem>
                              </IonCol>
                              
                              <IonCol size="8">
                                   <IonSelect onIonChange={setNewAddCategoryChangeHandler} className="dashed-border" value={addCategoryID}>
                                        {linkCategories?.map(link =>
                                             <IonSelectOption key={link.LinkCategoryID} value={link.LinkCategoryID}>{link.LinkCategoryName}</IonSelectOption>
                                        )}
                                   </IonSelect>
                              </IonCol>
                         </IonRow>
                    </IonGrid>
               </IonCard>
          </IonContent>
     )
}

export default AddComponent;
