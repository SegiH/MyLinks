import { IonButton, IonCol, IonContent, IonGrid, IonModal, IonRow } from '@ionic/react';

const ModalDialog = props => {
    return (
        <IonModal isOpen={props.isOpen} backdropDismiss="false">
            <IonContent>
                <IonGrid className="modalDialog">
                <IonRow>
                    <IonCol size="12">
                         {props.title}
                    </IonCol>

                    <IonCol>
                         <IonButton variant="primary" onClick={props.okHandler}>
                              OK
                         </IonButton>
                    </IonCol>

                    {props.modalDialogPrompt &&
                         <IonCol>
                              <IonButton variant="secondary" onClick={props.cancelHandler}>
                                   Cancel
                              </IonButton>
                         </IonCol>
                    }
                </IonRow>
                </IonGrid>                
            </IonContent>
        </IonModal>
    )
}

export default ModalDialog;