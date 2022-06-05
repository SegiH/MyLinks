import { useEffect, useState} from "react";
import { IonCol, IonContent, IonIcon, IonGrid, IonInput, IonLabel , IonSelect, IonSelectOption, IonRow, } from '@ionic/react';
import { closeOutline, pencilOutline, saveOutline } from 'ionicons/icons';

import axios from 'axios';

const EditComponent = props => {
     const [editName,setEditName] = useState("");
     const [editURL,setEditURL] = useState("");
     const [editCategoryID,setEditCategoryID] = useState(null);
     const [isEditing,setIsEditing] = useState(false);

     const cancelEditLink = () => {
          setIsEditing(false);
     }

     const closeEditLink = () => {
          props.setIsEditing(false);
     }

     const editLink = () => {
          setIsEditing(true);
     }

     const saveLink = async () => {
          if (editName === "") {
               props.showModalDialog("Please enter the name");
               return;
          }

          if (editURL === "") {
               props.showModalDialog("Please enter the URL");
               return;
          }

          if (editCategoryID === "") {
               props.showModalDialog("Please select the category");
               return;
          }

          await axios.put(`${props.backendURL}/UpdateLink?LinkID=${props.linkObj.LinkID}&Name=${editName}&URL=${editURL}&LinkCategoryID=${editCategoryID}`,null,{ headers: {"Authorization" : `Bearer ${props.authKey}`}})
          .then(res=> {
               if (res.data !== "") {
                    props.getURLs();
               } else {
                    props.showModalDialog(`An error occurred updating the link ${(typeof res !== 'undefined' && res[0] !== "OK" ? `with the error ${res[1]}` : "")}`);
               }
          })
          .catch(err=> {
               props.showModalDialog(`An error updating the link with the error ${err}`);
          })

          setIsEditing(false);

          const newCategoryDisplayName=props.linkCategories.filter(category => category.LinkCategoryID === editCategoryID)[0].LinkCategoryName;
          props.linkObj.LinkCategoryName=newCategoryDisplayName;
     }

     const setNewEditNameChangeHandler = (event) => {
          setEditName(event.target.value);
     }

     const setNewEditURLChangeHandler = (event) => {
          setEditURL(event.target.value);
     }

     const setNewEditCategoryChangeHandler = (event) => {
          setEditCategoryID(event.target.value);
     }

     useEffect(() => {
          if (typeof props.linkObj !== 'undefined') {
               setEditName(props.linkObj.Name);
               setEditURL(props.linkObj.URL);
               setEditCategoryID(props.linkObj.LinkCategoryID);
          }          
     },[props.linkObj, props.linkObj.Name, props.linkObj.URL, props.linkObj.LinkCategoryID]);

     const linkCategories=props.linkCategories.filter(category => category.LinkCategoryName !== "All");
     
     return (
          <IonContent className="dashed-border">
                    <IonGrid>
                         <IonRow>
                              <IonCol size="11">
                                   {!isEditing &&
                                        <IonIcon icon={pencilOutline} className="icon clickable" onClick={editLink}></IonIcon>
                                   }

                                   {isEditing &&
                                        <IonIcon icon={saveOutline} className="icon clickable" onClick={saveLink}></IonIcon>
                                   }
                              </IonCol>
                        
                              <IonCol size="1">
                                   {!isEditing &&
                                        <IonIcon icon={closeOutline} className="icon clickable" onClick={closeEditLink}></IonIcon>
                                   }

                                   {isEditing &&
                                        <IonIcon icon={closeOutline} className="icon clickable" onClick={cancelEditLink}></IonIcon>
                                   }
                              </IonCol>
                         </IonRow>

                         <IonRow>
                              <IonCol size="3">
                                   <IonLabel>ID</IonLabel>
                              </IonCol>

                              <IonCol size="8">
                                   {props.linkObj.LinkID}
                              </IonCol>
                         </IonRow>

                         <IonRow>
                              <IonCol size="3">
                                   <IonLabel>Name</IonLabel>
                              </IonCol>

                              <IonCol size="8">
                                   {!isEditing &&
                                        <div>{editName}</div>
                                   }

                                   {isEditing &&
                                        <IonInput className="dashed-border" type="text" value={editName} onIonChange={setNewEditNameChangeHandler} />
                                   }
                              </IonCol>
                         </IonRow>

                         <IonRow>
                              <IonCol size="3">
                                   <IonLabel>URL</IonLabel>
                              </IonCol>

                              <IonCol size="8">
                                   {!isEditing &&
                                        <div>{editURL}</div>
                                   }

                                   {isEditing &&
                                        <IonInput className="dashed-border" type="text" value={editURL} onIonChange={setNewEditURLChangeHandler} />
                                   }
                              </IonCol>
                         </IonRow>

                         <IonRow>
                              <IonCol size="3">
                                   <IonLabel>Category</IonLabel>
                              </IonCol>

                              <IonCol size="8">
                                   {!isEditing &&
                                        <div>{props.linkObj.LinkCategoryName}</div>
                                   }

                                   {isEditing &&
                                        <IonSelect onIonChange={setNewEditCategoryChangeHandler} className="dashed-border" value={editCategoryID}>
                                             {linkCategories?.map(link =>
                                                  <IonSelectOption key={link.LinkCategoryID} value={link.LinkCategoryID}>{link.LinkCategoryName}</IonSelectOption>
                                             )}
                                        </IonSelect>
                                   }
                              </IonCol>
                         </IonRow>
                    </IonGrid>
          </IonContent>
     )
}

export default EditComponent;
