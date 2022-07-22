interface TypeProps {
  id: number;
  name: string;
  primaryColor: string;
  secondaryColor: string
}

export default function Type(props: TypeProps) {
    return <div className="px-2 py-1 rounded-full border text-white font-bold w-full min-w-max flex justify-center" style={{backgroundColor: props.primaryColor, borderColor: props.secondaryColor}}>
        {props.name}
    </div>
}
