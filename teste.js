const { createUserWithEmailAndPassword } = require("firebase/auth");
const { auth } = require("./firebaseConfig");

async function testAuth() {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, "teste@jurex.com", "123456");
    console.log("Usuário criado:", userCredential.user.uid);
  } catch (error) {
    console.error("Erro ao criar usuário:", error);
  }
}

testAuth();
