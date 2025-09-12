"use client";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { FaApple, FaFacebook, FaRegEye, FaRegEyeSlash } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { FiCheck } from "react-icons/fi";
import { IoMailOutline } from "react-icons/io5";

const SignInContent = () => {
  const router = useRouter();
  const sp = useSearchParams();

  const [email, setEmail] = React.useState(sp.get("email") ?? "");
  const [password, setPassword] = React.useState("");
  const [showPw, setShowPw] = React.useState(false);
  const [remember, setRemember] = React.useState(false); // opsional UI saja
  const [loading, setLoading] = React.useState(false);
  const [err, setErr] = React.useState<string | null>(null);

  const callbackUrl = sp.get("callbackUrl") || "/dashboard";

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErr(null);
    setLoading(true);

    try {
      const res = await signIn("credentials", {
        email: email.trim(),
        password,
        redirect: false,
        callbackUrl,
      });

      if (!res?.error) {
        router.replace(res.url ?? callbackUrl);
      } else {
        setErr("Email or password is incorrect.");
      }
    } catch {
      setErr("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-1/2 bg-[hsla(0,0%,100%,.8)] backdrop-blur-[17px] h-screen p-[24px] overflow-auto flex items-center justify-center flex-wrap [@media(max-width:991.96px)]:w-full">
      <form className="w-[70%] [@media(max-width:991.96px)]:w-full" onSubmit={onSubmit}>
        <div>
          <div className="block max-w-[150px] m-auto">
            <Image src="/logo.png" width={80} height={80} alt="Bagi Kopi Idonesia" className="max-w-full h-auto mb-[25px]" />
          </div>

          <div className="m-[0_0_24px]">
            <h3 className="text-[24px] font-bold m-[0_0_10px] text-black">Sign In</h3>
            <h4 className="text-[#092c4c] leading-[1.4] text-[1rem]">Access the BagiKopi panel using your email and passcode.</h4>
          </div>

          {err && <div className="mb-4 text-sm text-rose-600 border border-rose-200 bg-rose-50 rounded-[.35rem] p-3">{err}</div>}

          <div className="mb-4">
            <label className="text-sm font-medium text-[#212b36]" htmlFor="email">
              Email <span className="text-rose-500">*</span>
            </label>
            <div className="relative flex flex-nowrap items-stretch w-full">
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                className="relative grow shrink basis-auto w-[1%} min-w-0 border border-[#e6eaed] text-[#212b36] bg-white text-[.875rem] leading-[1.6] rounded-[.35rem] p-[.45rem_.85rem] border-r-0 focus:ring-0 focus:outline-none"
                placeholder="you@example.com"
              />
              <button
                type="button"
                tabIndex={-1}
                className="ml-[calc(-1*1px)] bg-white p-[2px_10px] border-[#e6eaed] flex items-center text-[1rem] leading-[1.5] text-[#212529] text-center whitespace-nowrap"
              >
                <IoMailOutline size={16} />
              </button>
            </div>
          </div>

          <div className="mb-4">
            <label className="text-sm font-medium text-[#212b36]" htmlFor="password">
              Password <span className="text-rose-500">*</span>
            </label>
            <div className="relative flex flex-nowrap items-stretch w-full">
              <input
                id="password"
                name="password"
                type={showPw ? "text" : "password"}
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                className="relative grow shrink basis-auto w-[1%} min-w-0 border border-[#e6eaed] text-[#212b36] bg-white text-[.875rem] leading-[1.6] rounded-[.35rem] p-[.45rem_.85rem] border-r-0 focus:ring-0 focus:outline-none"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPw((s) => !s)}
                className="ml-[calc(-1*1px)] bg-white p-[2px_10px] border-[#e6eaed] flex items-center text-[1rem] leading-[1.5] text-[#212529] text-center whitespace-nowrap cursor-pointer"
              >
                {showPw ? <FaRegEye size={16} /> : <FaRegEyeSlash size={16} />}
              </button>
            </div>
          </div>

          <div className="mb-[15px]">
            <div className="flex flex-row">
              <div className="w-full grow-0 shrink-0 basis-auto flex items-center justify-between">
                <div className="flex items-center justify-center">
                  <label className="w-full leading-[1] block relative cursor-pointer text-[1rem] text-[#646b72] pl-[1.5rem]">
                    <input
                      type="checkbox"
                      checked={remember}
                      onChange={(e) => setRemember(e.target.checked)}
                      className="peer w-full h-[40px] border border-[rgba(145,158,171,.32)] rounded-[5px] p-[0_15px] transition-all duration-[.2s] ease-in absolute opacity-0 text-[#212b36] bg-white text-[.875rem] leading-[1.6] block appearance-none bg-clip-padding foo"
                    />
                    <span className="top-0 left-0 absolute rounded-[5px] border border-[#e6eaed] bg-white h-[16px] w-[16px] flex items-center justify-center peer-checked:bg-[#0076f9] peer-checked:border-[#0076f9] transition-all duration-200">
                      <FiCheck className="opacity-100 peer-checked:!opacity-0  text-white w-[12px] h-[12px]" />
                    </span>
                    Remember me
                  </label>
                </div>
                <div className="text-right">
                  <Link href="/auth/forgot-password" className="text-[1rem] font-medium text-[#0076f9]">
                    Forgot Password?
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-[15px]">
            <button
              type="submit"
              disabled={loading}
              className="bg-[#155eef] border border-[#155eef] text-white shadow-[0_4px_20px_rgba(21,94,239,.15)] rounded-[5px] p-[.4rem_.85rem] text-[.85rem] transition-all duration-[.5s] font-semibold w-full hover:bg-[#0e50d2] hover:border-[#0e50d2] hover:shdaow-[0_3px_10px_rgba(21,94,239,.5)] cursor-pointer disabled:opacity-60"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </div>

          <div className="mb-[23px]">
            <h4 className="text-[15px] text-[#092c4c] leading-[1.2]">
              New on our platform?{" "}
              <Link href="/auth/register" className="font-bold">
                Create an account
              </Link>
            </h4>
          </div>

          <div className="max-w-[365px] m-auto text-center relative text-[#b8bcc9] text-sm">
            <h4 className="relative text-sm text-[#646b72] font-bold before:content-[''] before:bg-[#b8bcc9] before:w-[21px] before:h-[1px] before:absolute before:top-[10px] before:right-[200px] after:content-[''] after:bg-[#b8bcc9] after:w-[21px] after:h-[1px] after:absolute after:top-[10px] after:left-[200px]">
              OR
            </h4>
          </div>

          <div className="mt-2">
            <div className="flex items-center justify-center flex-wrap gap-2">
              <div className="text-center grow shrink basis-auto">
                <button
                  type="button"
                  className="rounded-[.625rem] bg-[#155eef] border border-[#155eef] shadow-[0_4px_20px_rgba(21,94,239,.15)] text-white text-[.85rem] transition-all duration-[.5s] font-semibold p-2 flex items-center justify-center hover:bg-[#0e50d2] hover:border-[#0e50d2] hover:shdaow-[0_3px_10px_rgba(21,94,239,.5)] cursor-pointer w-full"
                >
                  <FaFacebook size={24} />
                </button>
              </div>
              <div className="text-center grow shrink basis-auto">
                <button
                  type="button"
                  className="rounded-[.625rem] bg-white  shadow-[0_4px_20px_rgba(21,94,239,.15)] text-white text-[.85rem] transition-all duration-[.5s] font-semibold p-2 flex items-center justify-center cursor-pointer w-full"
                >
                  <FcGoogle size={24} />
                </button>
              </div>
              <div className="text-center grow shrink basis-auto">
                <button
                  type="button"
                  className="rounded-[.625rem] bg-[#1B2850] border border-[#1B2850] shadow-[0_4px_20px_rgba(27,40,80,.15)] text-white text-[.85rem] transition-all duration-[.5s] font-semibold p-2 flex items-center justify-center hover:bg-[#121b35] hover:border-[#121b35] hover:shdaow-[0_3px_10px_rgba(27,40,80,.5)] cursor-pointer w-full"
                >
                  <FaApple size={24} />
                </button>
              </div>
            </div>
          </div>

          <div className="mb-6 mt-[50px] flex items-center justify-center">
            <p className="text-sm text-[#092c4c]">Copyright © {new Date().getFullYear()} BagiKopi</p>
          </div>
        </div>
      </form>
    </div>
  );
};

export default SignInContent;
