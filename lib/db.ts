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
  deleteDoc
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
  
  await updateDoc(postRef, {
    "poll.options": newOptions,
    [`poll.votedUsers.${userId}`]: optionId
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
          link: `/profile?id=${userId}`,
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
        link: `/profile?id=${author.id}`,
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
  const userRef = doc(db, "users", userId)
  return await updateDoc(userRef, data)
}

// CHATS
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
export async function createProject(owner: { id: string, name: string, avatar: string }, title: string, description: string, skills: string[], imageUrl: string | null = null, type: 'project' | 'startup' = 'project') {
  const projectRef = await addDoc(collection(db, "projects"), {
    owner,
    title,
    description,
    skills,
    imageUrl,
    type,
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
  return await addDoc(notificationsRef, {
    ...data,
    read: false,
    timestamp: serverTimestamp()
  })
}

export async function markNotificationRead(userId: string, notificationId: string) {
  const notificationRef = doc(db, "users", userId, "notifications", notificationId)
  return await updateDoc(notificationRef, {
    read: true
  })
}

export async function deletePost(postId: string) {
  const postRef = doc(db, "posts", postId)
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
