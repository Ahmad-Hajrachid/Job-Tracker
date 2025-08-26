import { db } from "./firebase";
import {collection,doc, addDoc, getDoc, getDocs, updateDoc, deleteDoc, query, where, orderBy} from 'firebase/firestore'

export const createJobApplication = async(jobData) =>{
    try {
        const docRef = await addDoc(collection(db,'jobApplications'),{
            company:jobData.company,
            position:jobData.position,
            status:jobData.status || 'applied',
            userId:jobData.uid,
            createdAt: new Date()
        });
        console.log("Document written with ID: ",docRef.id);
        return docRef.id;
    } catch (error) {
        console.error("Error adding document: ",error);
        throw error;
    }
};

export const getAllJobApplications = async () => {
    try {
        const querySnapshot = await getDocs(collection(db,'jobApplications'));
        const jobs = [];
        querySnapshot.forEach((doc)=>{
            jobs.push({id:doc.id, ...doc.data()});
        })
        return jobs;
    } catch (error) {
        console.error("Error getting job documents: ", error)
        throw error
    }
};

export const getJobApplication = async (id)=>{
    try {
        const docRef = doc(db,'jobApplications',id);
        const docSnap = await getDoc(docRef);

        if(docSnap.exists()){
            return {id:docSnap.id, ...docSnap.data()};
        } else {
            console.log("Documment doesn't exist")
            return null;
        }
    } catch (error) {
        console.error("Error getting job document ",error);
        throw error
    }
};

export const getJobByStatus= async (status)=>{
    try {
        const q= query(
            collection(db,'jobApplications'),
            where('status','==',status),
            orderBy('appliedDate','desc')
        );
        
        const querySnapshot= await getDocs(q);
        const jobs = [];
        querySnapshot.forEach((doc)=>{
            jobs.push({id:doc.id,...doc.data()});
        })
        return jobs;
    } catch (error) {
        console.error("Error getting job by status ",error)
        throw error
    }
}

export const updateJobApplication = async (id,updateData) =>{
    try {
        const docRef = doc(db,'jobApplications',id);
        await updateDoc(docRef,{
            ...updateData,
            updatedAt: new Date()
        });
        console.log("Document updated successfully");
    } catch (error) {
        console.error("Error updating the document ",error);
        throw error
    }
}

export const updateJobStatus = async(id,newStatus) =>{
    try {
        const docRef = doc(db,'jobApplications',id);
        await updateDoc(docRef,{
            status:newStatus,
            updatedAt: new Date()
        });
    } catch (error) {
        console.error("Error updating job status: ",error)
        throw error;
    }
}

export const deleteJobApplication = async (id)=>{
    try {
        await deleteDoc(doc(db,'jobApplications',id));
        console.log("Document deleted successfully");
    } catch (error) {
        console.error("Error deleting document: ",error);
        throw error;
    }
}

export const getUserRole = async (userId)=>{
    try {
        const userRef = doc(db,'Users',userId);
        const userSnap = await getDoc(userRef);

        if(userSnap.exists){
            const data = userSnap.data();
            return data.role;
        }else{
            console.log("User document doesn't exist");
            return null;
        }
    } catch (error) {
        console.error("Error getting user role ",error);
        throw error;
    }
}