import { useCallback, useEffect, useMemo, useState} from "react";
import { addOutline, closeOutline, pencilOutline, saveOutline, trashBinOutline } from 'ionicons/icons';

import { IonApp, IonButtons, IonCol, IonContent, IonGrid, IonHeader, IonIcon, IonInput, IonMenu, IonMenuButton, IonRefresher, IonRefresherContent, IonRow, IonSelect, IonSelectOption, IonTitle, IonToolbar, setupIonicReact } from '@ionic/react';

import AddComponent from './components/AddComponent';
import EditComponent from './components/EditComponent';
import ModalDialog from './components/ModalDialog';
import DataTable from 'react-data-table-component';
import FilterComponent from "./components/FilterComponent";

import axios from 'axios';

import { createStore, get, set, remove } from './components/Storage';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/* Theme variables */
import './theme/variables.css';

setupIonicReact();

const App = () => {
     const [authKey,setAuthKey] = useState("");
     const [backendURL,setBackendURL] = useState("");
     const [currentUserID,setCurrentUserID] = useState("");
     const [deleteLinkID,setDeleteLinkID] = useState(null);
     const [deleteDialogText,setDeleteDialogText] = useState('');
     const [filterText, setFilterText] = useState('');
     const [linkObj,setLinkObj] = useState(null);
     const [isAdding,setIsAdding] = useState(false);
     const [isEditing,setIsEditing] = useState(false);
     const [isEditingOptions,setIsEditingOptions] = useState(false);
     const [links,setLinks] = useState(null);
     const [linkCategories,setLinkCategories] = useState(null);
     const [newAuthKey,setNewAuthKey] = useState("");
     const [newBackendURL,setNewBackendURL] = useState("");
     const [newCurrentUserID,setNewCurrentUserID] = useState("");
     const [modalDialogIsOpen,setModalDialogIsOpen] = useState(false);
     const [modalDialogText,setModalDialogText] = useState(false);
     const [resetPaginationToggle, setResetPaginationToggle] = useState(false);
     const [users,setUsers] = useState(null);
     const [usersLoaded,setUsersLoaded] = useState(false);
     const [usersLoadingStarted,setUsersLoadingStarted] = useState(false);
     
     //const backendURL="";

     const addLinkClickHandler = () => {
          setIsAdding(true);
     }

     const cancelIsEditingOptionsHandler = () => {
          setIsEditingOptions(false);
     }

     const deleteLinkClickHandler = (LinkID,LinkName) => {
          setDeleteLinkID(LinkID)
          showModalDialog(`Are you sure that you want to delete ${LinkName} ?`,true)
     }

     const deleteLinkCancelHandler = () => {
          setModalDialogIsOpen(false);
     }

     const deleteLinkOKHandler = async () => {
          if (deleteLinkID !== null) {
               await axios.put(`${backendURL}/DeleteLink?LinkID=${deleteLinkID}`,null,{ headers: {"Authorization" : `Bearer ${authKey}`}})
               .then(res=> {
                    if (res.data !== "") {
                         getURLs();
                    } else {
                         showModalDialog(`An error occurred deleting the link ${(typeof res !== 'undefined' && res[0] !== "OK" ? `with the error ${res[1]}` : "")}`);
                    }
               })
               .catch(err=> {
                    showModalDialog(`An error occurred deleting the link`);
               })
          }

          setModalDialogIsOpen(false);
     }

     const editLinkClickHandler = (linkID) => {
          const linkObj=links.filter(link => link.LinkID === linkID)[0];
          setLinkObj(linkObj);

          setIsEditing(true);
     }

     const getUsers = useCallback(async () => {
          if (authKey === "" || authKey === null || usersLoadingStarted || backendURL === "" || backendURL === null)
               return;
         
          setUsersLoadingStarted(true);

          await axios.get(`${backendURL}/GetUsers`,{ headers: {"Authorization" : `Bearer ${authKey}`}})
          .then(res=> {
                if (res.data !== "") {
                     setUsers(res.data);
                     setUsersLoaded(true);
                     setUsersLoadingStarted(false);
                } else {
                     showModalDialog(`An error occurred get the users ${(typeof res !== 'undefined' && res[0] !== "OK" ? `with the error ${res[1]}` : "")}`);
                }
          })
          .catch(err=> {
               showModalDialog(`An error occurred getting the users with the error ${err.error}`);
          })
     }, [authKey, backendURL, usersLoadingStarted]);

     const getAuthKey = useCallback(async () => {
          const auth = await get('AuthKey');

          if (auth !== "" && auth !== null) {
               setAuthKey(auth);
          }
     }, []);

     const getBackendUrl = useCallback(async () => {
          const backendURL = await get('BackendURL');

          if (backendURL !== "" && backendURL !== null) {
               setBackendURL(backendURL);
          }
     }, []);

     const getCurrentUserID = useCallback(async () => {
          const userID = await get('CurrentUserID');

          if (userID !== "" && userID !== null) {
               setCurrentUserID(userID);
          }
     }, []);

     const getUserDisplayName = (userID) => {
          if (typeof users === 'undefined' || users === null )
               return;

          try {
          if (users.filter(user => user.UserID === userID)[0] !== 'undefined')
               return users.filter(user => user.UserID === userID)[0].UserDisplayName;
          else
               return null;
          } catch(err) {
               return null;
          }
     }

     const getLinkCategories = useCallback(async () => {
          if (authKey === "" || authKey === null || currentUserID?.length === 0)
               return;

          await axios.get(`${backendURL}/GetCategories?UserID=${currentUserID}`,{ headers: {"Authorization" : `Bearer ${authKey}`}})
          .then(res=> {
               if (res.data !== "") {
                    setLinkCategories(res.data);
               } else {
                    showModalDialog(`An error occurred get the link categories ${(typeof res !== 'undefined' && res[0] !== "OK" ? `with the error ${res[1]}` : "")}`);
               }
          })
          .catch(err=> {
               showModalDialog(`An error occurred getting the categories with the error ${err}`);
          })
     }, [authKey, backendURL, currentUserID]);

     const getURLs = useCallback(async () => {
          if (authKey === "" || authKey === null || currentUserID?.length === 0)
               return;

          await axios.get(`${backendURL}/GetLinks?UserID=${currentUserID}`,{ headers: {"Authorization" : `Bearer ${authKey}`}})
          .then(res=> {
               if (res.data !== "") {
                    setLinks(res.data);
               } else {
                    showModalDialog(`An error occurred get the URLs ${(typeof res !== 'undefined' && res[0] !== "OK" ? `with the error ${res[1]}` : "")}`);
                }
          })
          .catch(err=> {
               showModalDialog(`An error occurred getting the links with the error ${err}`);
          })
     }, [authKey, backendURL, currentUserID]);

     const isEditingOptionsHandler = () => {
          if (isEditingOptions === false) {
               // Use current values as default for new value
               setNewCurrentUserID(currentUserID);
               setNewAuthKey(authKey);
               setNewBackendURL(backendURL);

               if (authKey !== "" && usersLoaded === false) {
                    getUsers();                    
               }
          }

          setIsEditingOptions(!isEditingOptions);
     }

     const pullToRefresh = (event) => {
          getURLs();
          getLinkCategories();
          event.detail.complete();
     }

     const saveIsEditingOptionsHandler = () => {
          if (newAuthKey?.length === 0) {
               showModalDialog("Please enter the auth token");
               return;
          }

          if (newBackendURL?.length === 0) {
               showModalDialog("Please enter the backend URL");
               return;
          }

          if (usersLoaded && newCurrentUserID?.length === 0) {
               showModalDialog("Please select the user");
               return;
          } else {
               setCurrentUserID(newCurrentUserID);
               setCurrentUserIDStorage(newCurrentUserID);
          }

          setAuthKey(newAuthKey);
          setAuthKeyStorage(newAuthKey);
          setBackendURL(newBackendURL);
          setBackendURLStorage(newBackendURL);
          setIsEditingOptions(false);
     }

     const setAuthKeyStorage = async (newAuthKey) => {
          if (newAuthKey !== null && newAuthKey !== "") {
               set('AuthKey', newAuthKey);

               setAuthKey(newAuthKey);
           } else {
               await remove('AuthKey');

               setAuthKey('');
           }
     }

     const setBackendURLStorage = async (newBackendURL) => {
          if (newBackendURL !== null && newBackendURL !== "") {
               set('BackendURL', newBackendURL);

               setBackendURL(newBackendURL);
           } else {
               await remove('BackendURL');

               setBackendURL('');
           }
     }

     const setCurrentUserIDStorage = async (newCurrentUserID) => {
          if (newCurrentUserID !== null && newCurrentUserID !== "") {
               set('CurrentUserID', newCurrentUserID);
           } else {
               await remove('CurrentUserID');
           }
     }

     const setNewAuthKeyChangeHandler = (event) => {
          setNewAuthKey(event.target.value);
     }

     const setNewBackendURLChangeHandler = (event) => {
          setNewBackendURL(event.target.value);
     }

     const setNewCurrentUserIDClickHandler = (event) => {
          const userID=event.target.value;
          
          if (typeof userID !== 'undefined')
               setNewCurrentUserID(userID);
     }

     const showModalDialog = (dialogText,isPrompt) => {
          setDeleteDialogText(dialogText);

          if (isPrompt === true) {
               setModalDialogText(true);               
          }

          setModalDialogIsOpen(true);
     }

     const subHeaderComponentMemo = useMemo(() => {
		const handleClear = () => {
			if (filterText) {
				setResetPaginationToggle(!resetPaginationToggle);
				setFilterText('');
			}
		};

		return (
			<FilterComponent onFilter={e => setFilterText(e.target.value)} onClear={handleClear} filterText={filterText} />
		);
	}, [filterText, resetPaginationToggle]);

     useEffect(() => {
          const setupStore = async () => {
			createStore("MyLinks");
		}

		setupStore();

          if (!usersLoaded)
               getUsers();

          getCurrentUserID();

          getAuthKey();

          getBackendUrl()
     },[users, usersLoaded, getAuthKey, getBackendUrl, getUsers, getCurrentUserID]);
     
     useEffect(() => {
          if (currentUserID !== "") {
               getURLs();
               getLinkCategories();
          }
     },[currentUserID, getURLs,getLinkCategories]);

     useEffect(() => {
          if (linkCategories === null) {
               getLinkCategories();
          }          
     },[linkCategories, getLinkCategories]);

     const columns = [
          {
              name: 'ID',
              selector: row => row.LinkID,
              format: row =>  (!isAdding && !isEditing ? <div role="link" className="clickable link" onClick={() => editLinkClickHandler(row.LinkID)}>{row.LinkID}</div> : <div>{row.LinkID}</div>),
              width: "70px",
              sortable: true, 
          },
          {
              name: 'Name',
              selector: row => row.Name,
              format: row => (!isAdding && !isEditing ? <a href={row.URL} target="_blank" rel="noreferrer">{row.Name}</a> : <div>{row.Name}</div>),
              maxWidth: "550px",
              sortable: true
          },
          {
               name: 'Category',
               selector: row => row.LinkCategoryName,
               width: "150px",
               sortable: true
          },
          {
               name: 'Delete',
               width: "75px",
               selector: row => row.LinkID,
               format: row => <IonIcon icon={trashBinOutline} className="icon clickable" onClick={() => deleteLinkClickHandler(row.LinkID,row.Name)}></IonIcon>,
               omit: isAdding || isEditing
          },
     ];

     const filteredItems = links !== null && links.filter(
		item => (
               (item.Name && item.Name.toLowerCase().includes(filterText.toLowerCase()))
               ||
               (item.URL && item.URL.toLowerCase().includes(filterText.toLowerCase()))
               ||
               (item.LinkCategoryName && item.LinkCategoryName.toLowerCase().includes(filterText.toLowerCase()))
          )
	);

     return (
          <IonApp id="AppComponent">
                <IonMenu contentId="AppComponent" type="overlay" className="clickable ion-activatable">
                    <IonHeader>
                         <IonToolbar color="primary">
                              <IonTitle>MyLinks</IonTitle>
                         </IonToolbar>
                    </IonHeader>

                    <IonContent>
                         <IonGrid>
                              <IonRow>
                                   {!isEditingOptions && !isAdding && !isEditing &&
                                        <IonCol size="12">
                                             <IonIcon icon={pencilOutline} className="icon clickable" onClick={isEditingOptionsHandler} ></IonIcon>
                                        </IonCol>
                                   }

                                   {isEditingOptions &&
                                        <IonCol size="10">
                                             <IonIcon icon={saveOutline} className="icon clickable" onClick={saveIsEditingOptionsHandler} ></IonIcon>
                                        </IonCol>
                                   }

                                   {isEditingOptions &&
                                        <IonCol size="2">
                                              <IonIcon icon={closeOutline} className="icon clickable" onClick={cancelIsEditingOptionsHandler} ></IonIcon>
                                        </IonCol>
                                   }
                              </IonRow>

                              {authKey !== "" &&
                                   <IonRow>
                                        <IonCol size="6">                                        
                                             <div>Users</div>
                                        </IonCol>
                                   
                                        <IonCol size="6">
                                             {!isEditingOptions &&
                                                  <div>{getUserDisplayName(currentUserID)}</div>
                                             }

                                             {isEditingOptions && usersLoaded &&    
                                                  <IonSelect disabled={!isEditingOptions} onIonChange={setNewCurrentUserIDClickHandler} className="dashed-border" value={newCurrentUserID}>
                                                       {users?.map(user =>
                                                            <IonSelectOption key={user.UserID} value={user.UserID}>{user.UserDisplayName}</IonSelectOption>
                                                       )}
                                                  </IonSelect>
                                             }
                                        </IonCol>
                                   </IonRow>
                              }

                              <IonRow>
                                   <IonCol size="6">
                                        Auth Token
                                   </IonCol>

                                   {!isEditingOptions &&
                                        <IonCol size="6">
                                             {"*".repeat(authKey.length)}
                                        </IonCol>
                                   }

                                   {isEditingOptions &&
                                        <IonCol size="6">
                                             <IonInput className="dashed-border" type="password" value={newAuthKey} onIonChange={setNewAuthKeyChangeHandler} />
                                        </IonCol>
                                   }
                              </IonRow>

                              <IonRow>
                                   <IonCol size="6">
                                        Backend URL
                                   </IonCol>

                                   {!isEditingOptions &&
                                        <IonCol size="6">
                                             {backendURL}
                                        </IonCol>
                                   }

                                   {isEditingOptions &&
                                        <IonCol size="6">
                                             <IonInput className="dashed-border" type="text" value={newBackendURL} onIonChange={setNewBackendURLChangeHandler} />
                                        </IonCol>
                                   }
                              </IonRow>
                         </IonGrid>
                    </IonContent>
               </IonMenu>

               <IonToolbar color="primary">              
                    <IonButtons id="menuButtons">
                         <IonMenuButton></IonMenuButton>
                         
                         <IonTitle>{getUserDisplayName(currentUserID)}</IonTitle>

                         {links !== null && !isAdding && !isEditing &&
                              <IonIcon icon={addOutline} className="icon clickable" onClick={addLinkClickHandler}></IonIcon>
                         }
                    </IonButtons>
               </IonToolbar>

               {isEditing &&
                    <EditComponent authKey={authKey} backendURL={backendURL} getURLs={getURLs} linkCategories={linkCategories} linkObj={linkObj} setIsEditing={setIsEditing} showModalDialog={showModalDialog} />
               }

               {isAdding && 
                    <AddComponent authKey={authKey} backendURL={backendURL} currentUserID={currentUserID} getURLs={getURLs} linkCategories={linkCategories} setIsAdding={setIsAdding} showModalDialog={showModalDialog} />
               }

               <IonContent scroll="true">
                    <IonRefresher slot="fixed" onIonRefresh={pullToRefresh}>
                         <IonRefresherContent>
                         </IonRefresherContent>
                    </IonRefresher>
                    
                    {!isAdding && !isEditing &&
                         <DataTable className="dataTable" columns={columns} data={filteredItems} highlightOnHover subHeader subHeaderComponent={subHeaderComponentMemo} />
                    }

                    {(isAdding || isEditing) &&
                         <DataTable className="dataTable" columns={columns} data={filteredItems} highlightOnHover />
                    }
               </IonContent>
               
               <ModalDialog isOpen={modalDialogIsOpen} title={deleteDialogText} okHandler={deleteLinkOKHandler} cancelHandler={deleteLinkCancelHandler} modalDialogText={modalDialogText} />
          </IonApp>
     )
};

export default App;