# Dream3r Vault 🛡️

> *The matrix is yours to command. Data is the only currency that matters.*

**Dream3r Vault** is a high-security, **Zero-Knowledge** client-side steganography and cryptography station. It transforms your browser into an isolated fortress, allowing you to secure, hide, and manage high-value assets (**Ethereum Cold Wallets**, private keys) without ever exposing data to external servers.

---

## 🏷️ Tags
`#ETH` `#ColdWallet` `#Cryptography` `#Steganography` `#ZeroKnowledge` `#fsociety` `#Privacy` `#Web3` `#Security`

---

## 🚀 Why Dream3r Vault is Revolutionary

Unlike standard encryption tools, Dream3r Vault operates on the principle of **Plausible Deniability**.

*   **Zero-Knowledge Architecture:** All operations (encryption, wallet generation, steganography) occur strictly in your browser's memory. No API calls, no server-side logging, no data leaks.
*   **Anti-Forensic Scatter Protocol:** Traditional steganography is sequential and easily detectable by statistical analysis (Chi-square tests). Dream3r uses a **cryptographically secure PRNG (Scatter Protocol)** to scatter encrypted data across the image, making it indistinguishable from natural sensor noise.
*   **ETH Cold Wallet Generator:** Generate Ethereum Private Keys and Public Addresses using native browser entropy (`window.crypto`) and the `ethers` library. Your keys never touch the internet.
*   **Ghost Prompt Engine:** Procedural, offline prompt generation for AI-assisted image creation, ensuring your cover images are unique and non-profileable.

---

## 🔐 Core Features

| Feature | Description |
| :--- | :--- |
| **AES-256-GCM** | Military-grade authenticated encryption. |
| **Scatter Protocol** | Anti-forensic pixel scattering to defeat statistical analysis. |
| **ETH Generator** | Offline Ethereum wallet generation (Address + Private Key). |
| **Plausible Deniability** | Hide your secrets in plain sight within innocent images. |
| **Panic Button** | Instant memory wipe of all sensitive data. |

---

## 🛠️ Tech Stack

*   **Frontend:** React 19 + Vite
*   **Styling:** Tailwind CSS (Premium Hacker Dark UI)
*   **Crypto:** Web Crypto API (`window.crypto.subtle`) & `ethers.js`
*   **Steganography:** HTML5 Canvas API

---

## 📥 Installation & Setup

To run Dream3r Vault locally on your machine:

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/yourusername/dream3r-vault.git
    cd dream3r-vault
    ```

2.  **Install dependencies:**
    Make sure you have [Node.js](https://nodejs.org/) installed.
    ```bash
    npm install
    ```

3.  **Environment Variables:**
    Create a `.env` file in the root directory if you plan to use AI features (optional for core steganography):
    ```env
    GEMINI_API_KEY=your_api_key_here
    ```

4.  **Run in development mode:**
    ```bash
    npm run dev
    ```
    The app will be available at `http://localhost:3000`.

5.  **Build for production:**
    ```bash
    npm run build
    ```
    The production-ready files will be in the `dist/` folder.

---

## 🛡️ Security Disclaimer

Dream3r Vault is a powerful tool for high-value asset management. **Use at your own risk.**
*   Always keep your encryption passwords and Ethereum private keys in a secure, offline location.
*   The security of your data depends entirely on the strength of your password and the security of your local machine.

---

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🌟 Acknowledgments

Built for those who value absolute digital sovereignty.

<div align="center">
  <sub>Built with 🖤 by Dream3r</sub>
</div>
