import perfilStyle from "./perfil.module.css";

function PerfilComponent({image, name, infoTxt, btTxt, perfilBtClick}) {
    return(
        <div className={perfilStyle.perfilContainer}>
            <div className={perfilStyle.perfilFoto}>
                <img src={image}/>
            </div>
            <div className={perfilStyle.perfilName}>
                <h3>{name}</h3>
                <b>{infoTxt}</b>
            </div>
            <div className={perfilStyle.perfilButton}>
                <button onClick={perfilBtClick}>{btTxt}</button>
            </div>
        </div>
    );
}


export {PerfilComponent}