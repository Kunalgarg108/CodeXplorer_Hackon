import React from "react";
import { ContainerScroll } from "@/components/ui/container-scroll-animation";

export default function Hero() {
  return (
    <section className="bg-gray-50 flex items-center flex-col">
      <div className="flex flex-col overflow-hidden">
        <ContainerScroll
          titleComponent={
            <h1 className="text-4xl font-semibold text-black">
              Manage your Money with AI-Driven Personal <br />
              <span className="text-4xl md:text-[6rem] text-blue-800 font-bold mt-1 leading-none">
                Finance Advisor
              </span>
            </h1>
          }
        >
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl">
            <div className="text-center p-10">
              <img src="/chart-donut.svg" alt="hero" className="mx-auto w-32 h-32 mb-6" />
              <p className="text-xl text-gray-600">Track budgets, incomes & expenses with AI advice</p>
            </div>
          </div>
        </ContainerScroll>
      </div>
    </section>
  );
}
