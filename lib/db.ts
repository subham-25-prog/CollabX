import { db } from "./firebase"
import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  arrayUnion, 
  arrayRemove, 
  serverTimestamp,
  getDocs,
  query,
  orderBy,
  where,
  increment,
  getDoc,
  deleteDoc,
  writeBatch,
  limit
} from "firebase/firestore"

// POSTS
export async function createPost(author: { id: string, name: string, avatar: string, role: string }, content: string, image?: string, pollOptions?: string[], images?: string[]) {
  return await addDoc(collection(db, "posts"), {
    author,
    content,
    image: image || null,
    images: images || [],
    poll: pollOptions && pollOptions.length >= 2 ? {
      options: pollOptions.map((opt, i) => ({ id: i.toString(), text: opt, votes: 0 })),
      votedUsers: {} // Map of userId to optionId
    } : null,
    likes: [],
    commentsCount: 0,
    sharesCount: 0,
    timestamp: serverTimestamp(),
  })
}

export async function voteOnPoll(postId: string, userId: string, optionId: string) {
  const postRef = doc(db, "posts", postId)
  const postSnap = await getDoc(postRef)
  
  if (!postSnap.exists()) throw new Error("Post not found")
  
  const data = postSnap.data()
  if (!data.poll) throw new Error("Post does not have a poll")
  if (data.poll.votedUsers && data.poll.votedUsers[userId]) throw new Error("User already voted")
  
  const newOptions = data.poll.options.map((opt: any) => 
    opt.id === optionId ? { ...opt, votes: opt.votes + 1 } : opt
  )
  
  const updatedPoll = {
    ...data.poll,
    options: newOptions,
    votedUsers: {
      ...(data.poll.votedUsers || {}),
      [userId]: optionId
    }
  }

  await updateDoc(postRef, {
    poll: updatedPoll
  })
}

export async function togglePinPost(postId: string, isPinned: boolean) {
  const postRef = doc(db, "posts", postId)
  return await updateDoc(postRef, {
    isPinned: isPinned
  })
}

export async function toggleLikePost(postId: string, userId: string, isLiked: boolean, userName: string) {
  const postRef = doc(db, "posts", postId)
  if (isLiked) {
    return await updateDoc(postRef, {
      likes: arrayRemove(userId)
    })
  } else {
    const res = await updateDoc(postRef, {
      likes: arrayUnion(userId)
    })
    
    // Create notification for post owner (if not liking own post)
    const postSnap = await getDoc(postRef)
    if (postSnap.exists()) {
      const postData = postSnap.data()
      if (postData.author.id !== userId) {
        await createNotification(postData.author.id, {
          type: 'like',
          title: 'New Like',
          message: `${userName} liked your post.`,
          link: `/feed?post=${postId}`,
          senderId: userId
        })
      }
    }
    return res
  }
}

export async function createComment(postId: string, author: { id: string, name: string, avatar: string }, content: string) {
  const commentsRef = collection(db, "posts", postId, "comments")
  const res = await addDoc(commentsRef, {
    author,
    content,
    timestamp: serverTimestamp()
  })

  // Increment comment count
  const postRef = doc(db, "posts", postId)
  await updateDoc(postRef, {
    commentsCount: increment(1)
  })

  // Create notification for post owner
  const postSnap = await getDoc(postRef)
  if (postSnap.exists()) {
    const postData = postSnap.data()
    if (postData.author.id !== author.id) {
      await createNotification(postData.author.id, {
        type: 'comment',
        title: 'New Comment',
        message: `${author.name} commented on your post: "${content.substring(0, 50)}${content.length > 50 ? '...' : ''}"`,
        link: `/feed?post=${postId}`,
        senderId: author.id
      })
    }
  }

  return res
}

// USERS
export async function getAllUsers() {
  const usersQuery = query(collection(db, "users"))
  const snapshot = await getDocs(usersQuery)
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
}

export async function updateUserProfile(userId: string, data: any) {
  // Security: Prevent users from changing their own role to Admin through the UI
  const { role, ...safeData } = data
  
  const userRef = doc(db, "users", userId)
  const batch = writeBatch(db)
  
  batch.update(userRef, safeData)

  if (data.name !== undefined || data.avatar !== undefined || data.role !== undefined) {
    const postsQuery = query(collection(db, "posts"), where("author.id", "==", userId))
    const postsSnap = await getDocs(postsQuery)
    
    postsSnap.forEach(postDoc => {
      const updatePayload: any = {}
      if (data.name !== undefined) updatePayload["author.name"] = data.name
      if (data.avatar !== undefined) updatePayload["author.avatar"] = data.avatar
      if (data.role !== undefined) updatePayload["author.role"] = data.role
      batch.update(postDoc.ref, updatePayload)
    })

    const projectsQuery = query(collection(db, "projects"), where("owner.id", "==", userId))
    const projectsSnap = await getDocs(projectsQuery)
    
    projectsSnap.forEach(projDoc => {
      const updatePayload: any = {}
      if (data.name !== undefined) updatePayload["owner.name"] = data.name
      if (data.avatar !== undefined) updatePayload["owner.avatar"] = data.avatar
      batch.update(projDoc.ref, updatePayload)
    })
  }

  return await batch.commit()
}

// CHATS
export async function setTypingStatus(chatId: string, userId: string, isTyping: boolean) {
  const chatRef = doc(db, "chats", chatId)
  return await updateDoc(chatRef, {
    [`typing.${userId}`]: isTyping
  })
}

export async function createChat(participantIds: string[]) {
  // Simple chat creation
  return await addDoc(collection(db, "chats"), {
    participants: participantIds,
    updatedAt: serverTimestamp(),
    lastMessage: ""
  })
}

export async function sendMessage(chatId: string, senderId: string, content: string) {
  const messagesRef = collection(db, "chats", chatId, "messages")
  await addDoc(messagesRef, {
    content,
    senderId,
    timestamp: serverTimestamp()
  })

  // Update chat's last message
  const chatRef = doc(db, "chats", chatId)
  await updateDoc(chatRef, {
    lastMessage: content,
    updatedAt: serverTimestamp()
  })

  // Create notification for the other participants
  const chatSnap = await getDoc(chatRef)
  if (chatSnap.exists()) {
    const participants = chatSnap.data().participants || []
    for (const p of participants) {
      if (p !== senderId) {
        await createNotification(p, {
          type: 'message',
          title: 'New Message',
          message: `You have a new message.`,
          link: `/chat?id=${chatId}`,
          senderId
        })
      }
    }
  }
}

// PROJECTS
export async function createProject(owner: { id: string, name: string, avatar: string }, title: string, description: string, skills: string[], imageUrl: string | null = null, type: string = 'project', membersNeeded: string = "", duration: string = "", phase: string = "", commitment: string = "") {
  const projectRef = await addDoc(collection(db, "projects"), {
    owner,
    title,
    description,
    skills,
    imageUrl,
    type,
    membersNeeded,
    duration,
    phase,
    commitment,
    members: [owner.id], // Owner is a member
    applicants: [],
    status: "open",
    createdAt: serverTimestamp(),
  })

  // Create associated group chat
  const chatRef = await addDoc(collection(db, "chats"), {
    type: 'project',
    projectId: projectRef.id,
    participants: [owner.id],
    updatedAt: serverTimestamp(),
    lastMessage: `Group chat for ${title} created`
  })

  await updateDoc(projectRef, { chatId: chatRef.id })

  return projectRef
}

export async function toggleProjectStatus(projectId: string, status: 'open' | 'closed') {
  const projectRef = doc(db, "projects", projectId)
  return await updateDoc(projectRef, { status })
}

export async function applyToProject(projectId: string, userId: string) {
  const projectRef = doc(db, "projects", projectId)
  const res = await updateDoc(projectRef, {
    applicants: arrayUnion(userId)
  })

  const projectSnap = await getDoc(projectRef)
  if (projectSnap.exists()) {
    const projectData = projectSnap.data()
    await createNotification(projectData.owner.id, {
      type: 'application',
      title: 'New Project Application',
      message: `Someone applied to your project: ${projectData.title}`,
      link: `/teams?project=${projectId}`,
      senderId: userId
    })
  }

  return res
}

export async function acceptApplicant(projectId: string, userId: string) {
  const projectRef = doc(db, "projects", projectId)
  const res = await updateDoc(projectRef, {
    applicants: arrayRemove(userId),
    members: arrayUnion(userId)
  })

  const projectSnap = await getDoc(projectRef)
  if (projectSnap.exists()) {
    const projectData = projectSnap.data()

    // Add to group chat
    if (projectData.chatId) {
      await updateDoc(doc(db, "chats", projectData.chatId), {
        participants: arrayUnion(userId)
      })
    }

    await createNotification(userId, {
      type: 'application_accepted',
      title: 'Application Accepted!',
      message: `You were accepted into project: ${projectData.title}`,
      link: `/teams?project=${projectId}`,
      senderId: projectData.owner.id
    })
  }

  return res
}

export async function rejectApplicant(projectId: string, userId: string) {
  const projectRef = doc(db, "projects", projectId)
  const res = await updateDoc(projectRef, {
    applicants: arrayRemove(userId)
  })

  const projectSnap = await getDoc(projectRef)
  if (projectSnap.exists()) {
    const projectData = projectSnap.data()
    await createNotification(userId, {
      type: 'application_rejected',
      title: 'Application Update',
      message: `Your application to project ${projectData.title} was declined.`,
      link: `/teams`,
      senderId: projectData.owner.id
    })
  }

  return res
}

export async function inviteUserToProject(projectId: string, targetUserId: string, inviterName: string, projectTitle: string, inviterId: string) {
  const projectRef = doc(db, "projects", projectId)
  const res = await updateDoc(projectRef, {
    invites: arrayUnion(targetUserId)
  })

  await createNotification(targetUserId, {
    type: 'project_invite',
    title: 'Project Invitation',
    message: `${inviterName} invited you to join their project: ${projectTitle}`,
    link: `/teams?project=${projectId}`,
    senderId: inviterId
  })

  return res
}

export async function acceptProjectInvite(projectId: string, userId: string) {
  const projectRef = doc(db, "projects", projectId)
  const res = await updateDoc(projectRef, {
    invites: arrayRemove(userId),
    members: arrayUnion(userId)
  })

  const projectSnap = await getDoc(projectRef)
  if (projectSnap.exists()) {
    const projectData = projectSnap.data()
    
    // Add to group chat
    if (projectData.chatId) {
      await updateDoc(doc(db, "chats", projectData.chatId), {
        participants: arrayUnion(userId)
      })
    }

    // Notify the owner that the invite was accepted
    await createNotification(projectData.owner.id, {
      type: 'invite_accepted',
      title: 'Invitation Accepted',
      message: `A user has accepted your invitation to join ${projectData.title}.`,
      link: `/teams?project=${projectId}`,
      senderId: userId
    })
  }

  return res
}

// FOLLOWERS
export async function toggleFollowUser(currentUserId: string, targetUserId: string, isFollowing: boolean) {
  const currentUserRef = doc(db, "users", currentUserId)
  const targetUserRef = doc(db, "users", targetUserId)

  if (isFollowing) {
    // Unfollow
    await updateDoc(currentUserRef, { following: arrayRemove(targetUserId) })
    await updateDoc(targetUserRef, { followers: arrayRemove(currentUserId) })
  } else {
    // Follow
    await updateDoc(currentUserRef, { following: arrayUnion(targetUserId) })
    await updateDoc(targetUserRef, { followers: arrayUnion(currentUserId) })

    await createNotification(targetUserId, {
      type: 'follow',
      title: 'New Follower',
      message: `Someone started following you.`,
      link: `/profile?id=${currentUserId}`,
      senderId: currentUserId
    })
  }
}

// NOTIFICATIONS
export async function createNotification(userId: string, data: {
  type: string,
  title: string,
  message: string,
  link?: string,
  senderId?: string
}) {
  const notificationsRef = collection(db, "users", userId, "notifications")
  const res = await addDoc(notificationsRef, {
    ...data,
    read: false,
    timestamp: serverTimestamp()
  })

  // Trigger Push Notification
  try {
    const userDoc = await getDoc(doc(db, "users", userId));
    if (userDoc.exists()) {
      const userData = userDoc.data();
      if (userData.fcmTokens && Array.isArray(userData.fcmTokens) && userData.fcmTokens.length > 0) {
        fetch("/api/notifications/send", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: data.title,
            body: data.message,
            tokens: userData.fcmTokens,
            data: { link: data.link || "/" }
          })
        }).catch(err => console.error("Failed to trigger push notification API", err));
      }
    }
  } catch (error) {
    console.error("Error fetching user for push notification:", error);
  }

  return res;
}

export async function markNotificationRead(userId: string, notificationId: string) {
  const notificationRef = doc(db, "users", userId, "notifications", notificationId)
  return await updateDoc(notificationRef, {
    read: true
  })
}

export async function deletePost(postId: string, deletedByAdmin: boolean = false, adminId?: string) {
  const postRef = doc(db, "posts", postId)
  
  if (deletedByAdmin && adminId) {
    const postSnap = await getDoc(postRef)
    if (postSnap.exists()) {
      const postData = postSnap.data()
      if (postData.author.id !== adminId) {
        await createNotification(postData.author.id, {
          type: 'warning',
          title: 'Post Deleted by Admin',
          message: `Your post was deleted by an admin for violating community guidelines.`,
          link: `/`,
          senderId: adminId
        })
      }
    }
  }

  return await deleteDoc(postRef)
}

export async function deleteProject(projectId: string) {
  const projectRef = doc(db, "projects", projectId)
  const projectSnap = await getDoc(projectRef)
  if (projectSnap.exists()) {
    const projectData = projectSnap.data()
    if (projectData.chatId) {
      await deleteDoc(doc(db, "chats", projectData.chatId))
    }
  }
  return await deleteDoc(projectRef)
}

// CHAT MANAGEMENT
export async function muteChat(currentUserId: string, chatId: string) {
  const userRef = doc(db, "users", currentUserId)
  await updateDoc(userRef, {
    mutedChats: arrayUnion(chatId)
  })
}

export async function blockUser(currentUserId: string, blockedUserId: string) {
  const userRef = doc(db, "users", currentUserId)
  await updateDoc(userRef, {
    blockedUsers: arrayUnion(blockedUserId)
  })
}

export async function reportUser(reporterId: string, reportedId: string, reason: string = "Inappropriate behavior") {
  await addDoc(collection(db, "reports"), {
    reporterId,
    reportedId,
    reason,
    timestamp: serverTimestamp()
  })
}

export async function deleteChat(chatId: string) {
  const chatRef = doc(db, "chats", chatId)
  await deleteDoc(chatRef)
}

// CELEBRATIONS
export async function createCelebration(author: { id: string, name: string, avatar: string }, content: string, imageUrl: string, type: string = 'birthday') {
  return await addDoc(collection(db, "celebrations"), {
    author,
    content,
    imageUrl,
    type,
    likes: [],
    timestamp: serverTimestamp()
  })
}

export async function toggleLikeCelebration(celebrationId: string, userId: string, isLiked: boolean) {
  const celebrationRef = doc(db, "celebrations", celebrationId)
  if (isLiked) {
    return await updateDoc(celebrationRef, {
      likes: arrayRemove(userId)
    })
  } else {
    return await updateDoc(celebrationRef, {
      likes: arrayUnion(userId)
    })
  }
}

export async function deleteCelebration(celebrationId: string) {
  return await deleteDoc(doc(db, "celebrations", celebrationId))
}
