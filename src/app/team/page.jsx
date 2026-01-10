import NavbarTop from "../components/topnavbar";

export default function Team() {
  return (
    <>
    <NavbarTop/>
    <div className="page">
      <h1>➕ Create a Team</h1>

      <div className="card">
        <input placeholder="Team Name" />
        <br /><br />
        <button>Create Team</button>

        <div className="image-box" aria-label="Team collaboration illustration">
          Image: teamwork / collaboration
        </div>
      </div>
    </div>
    </>
  );
}
