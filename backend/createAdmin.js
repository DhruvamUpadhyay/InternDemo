const { auth } = require('./firebaseAdmin');

async function createAdminUser() {
  const email = 'veer@skillbridgeladder.in';
  const password = 'Veer@123';

  if (!auth) {
    console.error("Auth is not initialized. Please check Firebase Service Account JSON.");
    process.exit(1);
  }

  try {
    const userRecord = await auth.createUser({
      email: email,
      password: password,
      emailVerified: true,
    });
    console.log(`Successfully created user: ${userRecord.uid}`);
    
    // Grant admin privileges via custom claims
    await auth.setCustomUserClaims(userRecord.uid, { admin: true });
    console.log(`Successfully granted admin privileges to ${email}`);
    process.exit(0);
  } catch (error) {
    if (error.code === 'auth/email-already-exists') {
        console.log(`User ${email} already exists. Attempting to update password...`);
        try {
            const user = await auth.getUserByEmail(email);
            await auth.updateUser(user.uid, { password: password });
            await auth.setCustomUserClaims(user.uid, { admin: true });
            console.log(`Successfully updated password and granted admin privileges for ${email}`);
            process.exit(0);
        } catch (updateError) {
             console.error('Error updating user:', updateError);
             process.exit(1);
        }
    } else {
        console.error('Error creating new user:', error);
        process.exit(1);
    }
  }
}

createAdminUser();
